import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import { apiGet } from './utils/api';

export default function PingTest() {
  const [message, setMessage] = useState('');
  const handlePing = async () => {
    const res = await apiGet('/ping');
    setMessage(res.message);
  };
  return (
    <View style={{margin: 20}}>
      <Button title="Test Backend" onPress={handlePing} />
      {message ? <Text style={{marginTop: 10}}>Răspuns backend: {message}</Text> : null}
    </View>
  );
}