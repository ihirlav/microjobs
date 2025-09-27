import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import OrderDemo from './OrderDemo';

export default function StripeWrapper({ userId }) {
  return (
    <StripeProvider publishableKey="pk_test_51N..."> {/* Înlocuiește cu cheia publică Stripe reală */}
      <OrderDemo userId={userId} />
    </StripeProvider>
  );
}
