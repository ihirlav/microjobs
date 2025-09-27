import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

function PaymentForm({ clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card }
    });
    if (error) {
      alert(error.message);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{marginTop:16}}>
      <CardElement options={{ style: { base: { fontSize: '18px' } } }} />
      <button type="submit" style={{marginTop:16, background:'#009975', color:'#fff', border:'none', borderRadius:8, padding:'12px 32px', fontWeight:700, fontSize:16, cursor:'pointer'}}>Plătește</button>
    </form>
  );
}

export default PaymentForm;
