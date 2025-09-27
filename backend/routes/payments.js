const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

// Creează un PaymentIntent pentru escrow
router.post('/create-payment-intent', async (req, res) => {
  const { amount, currency = 'ron' } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe folosește bani în subunități (bani, nu lei)
      currency,
      payment_method_types: ['card'],
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

module.exports = router;
