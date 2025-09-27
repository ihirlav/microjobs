import React, { useState } from 'react';
import { createOrder, createPaymentIntent } from './utils/api';
import PaymentForm from './PaymentForm';
import { View, Text, TextInput, Button } from 'react-native';

export default function OrderDemo({ userId }) {
  const [orderId, setOrderId] = useState('');
  const [form, setForm] = useState({ title: '', description: '', amount: '', beneficiary: userId, provider: '' });
  const [msg, setMsg] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paid, setPaid] = useState(false);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleCreate = async () => {
    setMsg('');
    // 1. Creează PaymentIntent
    const paymentRes = await createPaymentIntent(Number(form.amount));
    if (!paymentRes.clientSecret) {
      setMsg(paymentRes.error || 'Eroare la inițiere plată');
      return;
    }
    setClientSecret(paymentRes.clientSecret);
    setShowPayment(true);
    // 2. Creează comanda cu paymentIntentId
    const orderRes = await createOrder({ ...form, amount: Number(form.amount), paymentIntentId: paymentRes.clientSecret.split('_secret')[0] });
    if (orderRes._id) {
      setOrderId(orderRes._id);
      setMsg('Comandă creată! Continuă cu plata.');
    } else {
      setMsg(orderRes.error || 'Eroare la creare comandă');
    }
  };

  return (
    <View style={{borderWidth:1, borderColor:'#ccc', padding:10, margin:10, maxWidth:400}}>
      <Text style={{fontWeight:'bold', fontSize:18, marginBottom:8}}>Plasează comandă</Text>
      <TextInput placeholder="Titlu" value={form.title} onChangeText={v => handleChange('title', v)} style={{borderWidth:1, marginBottom:8, padding:6}} />
      <TextInput placeholder="Descriere" value={form.description} onChangeText={v => handleChange('description', v)} style={{borderWidth:1, marginBottom:8, padding:6}} />
      <TextInput placeholder="Suma" value={form.amount} onChangeText={v => handleChange('amount', v)} keyboardType="numeric" style={{borderWidth:1, marginBottom:8, padding:6}} />
      <TextInput placeholder="ID Prestator" value={form.provider} onChangeText={v => handleChange('provider', v)} style={{borderWidth:1, marginBottom:8, padding:6}} />
      <Button title="Creează comandă și inițiază plata" onPress={handleCreate} />
      {showPayment && clientSecret && !paid && (
        <View style={{marginTop:20, backgroundColor:'#f9f7f1', padding:16, borderRadius:8}}>
          <Text style={{fontWeight:'bold'}}>Plateste cu cardul:</Text>
          <PaymentForm clientSecret={clientSecret} onSuccess={()=>{setPaid(true); setMsg('Plată efectuată cu succes!')}} />
        </View>
      )}
      {paid && <Text style={{marginTop:16, color:'#009975', fontWeight:'bold'}}>Plată efectuată cu succes!</Text>}
      <Text style={{marginTop:8, color:'#009975'}}>{msg}</Text>
    </View>
  );
}
