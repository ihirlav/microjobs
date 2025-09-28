// src/api.js

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`);
  return res.json();
}

export async function apiPost(path, data) {
  const res = await fetch(`${API_URL}${path}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return res.json();
}

export async function apiPut(path, data, token) {
  const res = await fetch(`${API_URL}${path}`,
    { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(data) });
  return res.json();
}

export async function apiRegister(data) {
  return apiPost('/api/auth/register', data);
}

export async function apiLogin(data) {
  return apiPost('/api/auth/login', data);
}

export async function createPaymentIntent(amount) {
  return apiPost('/api/payments/create-payment-intent', { amount });
}

export async function capturePayment(paymentIntentId) {
  return apiPost('/api/payments/capture-payment', { paymentIntentId });
}

export async function createOrder(data) {
  return apiPost('/api/orders', data);
}

export async function approveOrder(orderId, data) {
  return apiPost(`/api/orders/${orderId}/approve`, data);
}

export async function providerReview(orderId, data) {
  return apiPost(`/api/orders/${orderId}/review-provider`, data);
}

export async function fetchAIAgentStatus() {
  const res = await fetch(`${API_URL}/api/ai-agents/status`);
  return res.json();
}

export async function approveAIPayout() {
  const res = await fetch(`${API_URL}/api/ai-agents/payments/approve`, { method: 'POST' });
  return res.json();
}

export async function declineAIPayout() {
  const res = await fetch(`${API_URL}/api/ai-agents/payments/decline`, { method: 'POST' });
  return res.json();
}

export async function loginUser(email, password) {
  return apiPost('/api/auth/login', { email, password });
}

export async function reserveJob(jobId, token) {
  const res = await fetch(`${API_URL}/api/orders/${jobId}/reserve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({})
  })
  return res.json();
}

export async function fetchPublicJobs() {
  const res = await fetch(`${API_URL}/api/orders/public`);
  return res.json();
}

export async function searchJobs(query) {
  const res = await fetch(`${API_URL}/api/orders/search?q=${encodeURIComponent(query)}`);
  return res.json();
}
