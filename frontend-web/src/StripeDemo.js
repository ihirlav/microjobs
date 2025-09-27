import React, { useState } from 'react';
import { createPaymentIntent, capturePayment } from './api';

function StripeDemo() {
  const [amount, setAmount] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [msg, setMsg] = useState('');

  const handleCreate = async () => {
    setMsg('');
    const res = await createPaymentIntent(Number(amount));
    if (res.clientSecret) {
      setClientSecret(res.clientSecret);
      setMsg('PaymentIntent creat! (simulare)');
    } else {
      setMsg(res.error || 'Eroare');
    }
  };

  const handleCapture = async () => {
    setMsg('');
    // Într-o aplicație reală, paymentIntentId se obține din backend sau Stripe dashboard
    const paymentIntentId = clientSecret.split('_secret')[0];
    const res = await capturePayment(paymentIntentId);
    setMsg(res.success ? 'Plată eliberată!' : res.error);
  };

  return (
    <div style={{border:'1px solid #ccc', padding:10, margin:10}}>
      <h3>Stripe Demo</h3>
      <input type="number" placeholder="Suma (RON)" value={amount} onChange={e => setAmount(e.target.value)} />
      <button onClick={handleCreate}>Inițiază plată</button>
      {clientSecret && <button onClick={handleCapture}>Eliberează banii</button>}
      <div style={{marginTop:8, color:'green'}}>{msg}</div>
    </div>
  );
}

export default StripeDemo;
