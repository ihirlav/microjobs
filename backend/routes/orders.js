const express = require('express');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { capturePayment } = require('./payments');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

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
  const { rating, comment, userId } = req.body;
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Comandă inexistentă' });
    order.status = 'approved';
    order.completedAt = new Date();
    await order.save();
    // Salvează review-ul beneficiarului
    await new Review({ order: order._id, from: userId, to: order.provider, rating, comment }).save();
    res.json({ success: true });
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
    const reviews = await Review.find({ order: order._id });
    if (reviews.length >= 2 && order.status === 'approved') {
      // Eliberează banii
      const payments = require('./payments');
      await payments.capturePayment({ body: { paymentIntentId: order.paymentIntentId } }, { json: () => {} });
      order.status = 'paid';
      await order.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
