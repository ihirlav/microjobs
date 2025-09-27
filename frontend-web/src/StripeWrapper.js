import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import OrderDemo from './OrderDemo';

const stripePromise = loadStripe('pk_test_51N...'); // Înlocuiește cu cheia publică Stripe reală

function StripeWrapper({ userId }) {
  return (
    <Elements stripe={stripePromise}>
      <OrderDemo userId={userId} />
    </Elements>
  );
}

export default StripeWrapper;
