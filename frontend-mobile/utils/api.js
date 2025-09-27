// utils/api.js
const API_URL = 'http://localhost:5000';

export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`);
  return res.json();
}

export async function apiPost(path, data) {
  const res = await fetch(`${API_URL}${path}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
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
