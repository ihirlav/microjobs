import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

function PaymentForm({ clientSecret, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Asigură-te că această pagină există sau specifică una validă
        return_url: `${window.location.origin}/payment-success`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{marginTop:16}}>
      <PaymentElement />
      <button disabled={isLoading || !stripe || !elements} type="submit" style={{marginTop:16, background:'#009975', color:'#fff', border:'none', borderRadius:8, padding:'12px 32px', fontWeight:700, fontSize:16, cursor:'pointer'}}>
        {isLoading ? 'Processing...' : 'Plătește'}
      </button>
      {errorMessage && <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>}
    </form>
  );
}

export default PaymentForm;
