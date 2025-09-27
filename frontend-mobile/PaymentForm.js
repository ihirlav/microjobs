import React, { useState } from 'react';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { View, Button, Text } from 'react-native';

export default function PaymentForm({ clientSecret, onSuccess }) {
  const { confirmPayment } = useStripe();
  const [card, setCard] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setLoading(true);
    setError('');
    const { error, paymentIntent } = await confirmPayment(clientSecret, {
      paymentMethodType: 'Card',
      paymentMethodData: { billingDetails: {} }
    });
    setLoading(false);
    if (error) setError(error.message);
    else if (paymentIntent && paymentIntent.status === 'Succeeded') onSuccess();
  };

  return (
    <View style={{marginTop:16}}>
      <CardField
        postalCodeEnabled={false}
        placeholder={{ number: '4242 4242 4242 4242' }}
        cardStyle={{ backgroundColor: '#fff', textColor: '#222' }}
        style={{ width: '100%', height: 50, marginVertical: 16 }}
        onCardChange={cardDetails => setCard(cardDetails)}
      />
      <Button title={loading ? 'Se procesează...' : 'Plătește'} onPress={handlePay} disabled={loading || !card.complete} />
      {!!error && <Text style={{color:'red', marginTop:8}}>{error}</Text>}
    </View>
  );
}
