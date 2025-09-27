import React, { useState } from 'react';
import { apiGet } from './api';

function PingTest() {
  const [message, setMessage] = useState('');
  const handlePing = async () => {
    const res = await apiGet('/ping');
    setMessage(res.message);
  };
  return (
    <div>
      <button onClick={handlePing}>Test Backend</button>
      <div>{message && `Răspuns backend: ${message}`}</div>
    </div>
  );
}

export default PingTest;