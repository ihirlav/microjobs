const express = require('express');
const Order = require('../models/Order');
const Review = require('../models/Review');
const User = require('../models/User');
const AgentLog = require('../models/AgentLog');
const { capturePayment } = require('./payments');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const ics = require('ics');

const router = express.Router();

// Creează comandă (după acceptarea ofertei și inițierea plății)
router.post('/', async (req, res) => {
  const { title, description, amount, beneficiary, provider, paymentIntentId } = req.body;
  try {
    const order = new Order({ title, description, amount, beneficiary, provider, paymentIntentId, status: 'accepted' });
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Beneficiarul confirmă finalizarea și lasă review
router.post('/:id/approve', async (req, res) => {
  const { rating, comment, criteria, userId } = req.body;
  try {
    const order = await Order.findById(req.params.id).populate('provider');
    if (!order) return res.status(404).json({ error: 'Comanda nu a fost găsită.' });
    if (order.status !== 'completed') return res.status(400).json({ error: 'Lucrarea trebuie marcată ca finalizată înainte de a putea fi aprobată.' });

    order.status = 'approved';
    order.completedAt = new Date();
    await order.save();

    // --- Logică Gamificare ---
    // Acordă XP pentru finalizarea comenzii
    const xpGained = Math.round(order.amount / 10); // Exemplu: 1 XP pentru fiecare 10 RON
    
    // Funcție helper pentru a adăuga XP și a verifica level up
    const addXp = async (userId, amount) => {
      const user = await User.findById(userId);
      if (!user) return;
      user.xp += amount;
      // Simplu level up: la fiecare 100 XP
      if (user.xp >= (user.level * 100)) {
        user.level += 1;
      }
      await user.save();
    };

    // Calculează ratingul general ca medie
    const averageRating = criteria ? (criteria.quality + criteria.communication + criteria.punctuality) / 3 : rating;

    // Salvează review-ul beneficiarului
    await new Review({ order: order._id, from: userId, to: order.provider, rating: averageRating, criteria, comment }).save();

    // 1. Capturează plata de la beneficiar
    await stripe.paymentIntents.capture(order.paymentIntentId);

    // 2. Calculează comisionul și suma de transferat
    const amountToTransfer = Math.round(order.amount * 0.9 * 100); // 90% către prestator, în subunități (bani)

    // 3. Transferă banii către contul conectat al prestatorului
    if (order.provider.stripeAccountId) {
      await stripe.transfers.create({
        amount: amountToTransfer,
        currency: 'ron',
        destination: order.provider.stripeAccountId,
      });
    }

    res.json({ success: true });

    // Log pentru AI Dashboard
    new AgentLog({ agent: 'payments', message: `Released escrow for order ${order._id} (${order.amount} RON)` }).save();

    // Acordă XP ambilor utilizatori după ce totul a funcționat
    await addXp(order.provider, xpGained);
    await addXp(order.beneficiary, xpGained);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Prestatorul lasă review și banii se eliberează dacă ambele review-uri există
router.post('/:id/review-provider', async (req, res) => {
  const { rating, comment, userId } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Comandă inexistentă' });
    // Salvează review-ul prestatorului
    await new Review({ order: order._id, from: userId, to: order.beneficiary, rating, comment }).save();
    // Verifică dacă există ambele review-uri
    // Logica de eliberare a banilor a fost mutată în ruta /approve
    // Aici se poate adăuga o notificare sau altă acțiune post-review
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rută pentru căutare avansată (AI-powered)
router.get('/search', async (req, res) => {
  const { q } = req.query; // q = search query
  if (!q) {
    return res.status(400).json({ error: 'Search query is required.' });
  }
  try {
    const jobs = await Order.find(
      { $text: { $search: q } }, // Folosim operatorul $text pentru căutare
      { score: { $meta: 'textScore' } } // Proiectăm scorul de relevanță
    )
    .sort({ score: { $meta: 'textScore' } }) // Sortăm după relevanță
    .populate('beneficiary', 'firstName lastName');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Search failed.' });
  }
});

// Rută pentru a genera un eveniment de calendar (.ics)
router.get('/:id/calendar', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    const event = {
      start: [
        new Date(order.createdAt).getFullYear(),
        new Date(order.createdAt).getMonth() + 1,
        new Date(order.createdAt).getDate(),
        new Date(order.createdAt).getHours(),
        new Date(order.createdAt).getMinutes()
      ],
      duration: { hours: order.hours || 1 },
      title: order.title,
      description: order.description,
      status: 'CONFIRMED',
    };

    const { error, value } = ics.createEvent(event);
    if (error) throw error;

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="job-${order._id}.ics"`);
    res.send(value);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate calendar event.' });
  }
});

// Public endpoint: get all jobs (no auth required)
router.get('/public', async (req, res) => {
  try {
    const jobs = await Order.find({ status: 'open' });
    res.json(jobs);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Notificare la rezervare job
router.post('/:id/reserve', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Login required' });
  const job = await Order.findById(req.params.id).populate('beneficiary provider');
  if (!job || job.status !== 'open') return res.status(400).json({ error: 'Job not available' });
  // Check provider availability (stub)
  // ...matching logic here...
  job.status = 'reserved';
  job.provider = req.user._id;
  await job.save();
  // Notifică ambele părți
  if (job.beneficiary?.email) await sendNotification(job.beneficiary.email, 'Job reserved', `Your job '${job.title}' was reserved.`);
  if (job.provider?.email) await sendNotification(job.provider.email, 'New job assigned', `You have a new job: '${job.title}'.`);
  res.json({ success: true, job });
});

// Create payment intent for job reservation
router.post('/:id/pay', async (req, res) => {
  try {
    const job = await Order.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(job.amount * 100), // RON to bani
      currency: 'ron',
      metadata: { jobId: job._id.toString() }
    });
    job.paymentIntentId = paymentIntent.id;
    await job.save();
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Generate invoice PDF after job completion
router.get('/:id/invoice', async (req, res) => {
  try {
    const job = await Order.findById(req.params.id).populate('beneficiary provider');
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${job._id}.pdf`);
    doc.text(`Invoice for job: ${job.title}`);
    doc.text(`Client: ${job.beneficiary?.name || ''}`);
    doc.text(`Provider: ${job.provider?.name || ''}`);
    doc.text(`Amount: ${job.amount} RON`);
    doc.text(`Date: ${job.updatedAt}`);
    doc.end();
    doc.pipe(res);
  } catch (e) {
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

// Escrow release la finalizare job
router.post('/:id/release-escrow', async (req, res) => {
  try {
    const job = await Order.findById(req.params.id).populate('provider');
    if (!job || job.status !== 'completed') return res.status(400).json({ error: 'Job not completed' });
    // Stripe payout (stub)
    // await stripe.transfers.create({
    //   amount: Math.round(job.amount * 0.9 * 100), // 90% to provider
    //   currency: 'ron',
    //   destination: job.provider.stripeAccountId
    // });
    job.status = 'paid';
    await job.save();
    if (job.provider?.email) await sendNotification(job.provider.email, 'Payment released', `Payment for job '${job.title}' has been released.`);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to release escrow' });
  }
});

async function sendNotification(email, subject, text) {
  // Dummy mailer for demo; configure real SMTP in production
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  await transporter.sendMail({ from: 'no-reply@microjobs.com', to: email, subject, text });
}

module.exports = router;
