import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { createPaymentIntent, capturePayment } from './utils/api';

export default function StripeDemo() {
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
    const paymentIntentId = clientSecret.split('_secret')[0];
    const res = await capturePayment(paymentIntentId);
    setMsg(res.success ? 'Plată eliberată!' : res.error);
  };

  return (
    <View style={{margin:20, borderWidth:1, borderColor:'#ccc', padding:10}}>
      <Text style={{fontWeight:'bold'}}>Stripe Demo</Text>
      <TextInput placeholder="Suma (RON)" value={amount} onChangeText={setAmount} keyboardType="numeric" style={{borderWidth:1, marginBottom:8, padding:6}} />
      <Button title="Inițiază plată" onPress={handleCreate} />
      {clientSecret ? <Button title="Eliberează banii" onPress={handleCapture} /> : null}
      {!!msg && <Text style={{marginTop:8, color:'green'}}>{msg}</Text>}
    </View>
  );
}
