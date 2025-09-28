const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Creează un PaymentIntent pentru escrow
router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency = 'ron' } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe folosește bani în subunități (bani, nu lei)
      currency,
      payment_method_types: ['card', 'paypal'], // Adăugăm PayPal ca metodă de plată
      capture_method: 'manual', // Escrow: banii nu sunt eliberați automat
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Confirmă și eliberează banii către prestator
router.post('/capture-payment', async (req, res) => {
  const { paymentIntentId } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);
    res.json({ success: true, paymentIntent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Creează un link de onboarding pentru Stripe Connect
router.post('/create-connect-account', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Creează un cont Stripe Express dacă nu există deja
    if (!user.stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
      });
      user.stripeAccountId = account.id;
      await user.save();
    }

    // Generează un link de login unic pentru contul conectat
    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId,
      refresh_url: `${process.env.FRONTEND_URL}/profile`,
      return_url: `${process.env.FRONTEND_URL}/profile`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create Stripe Connect account link.' });
  }
});

module.exports = router;
