import React, { useState } from 'react';
import { createOrder, createPaymentIntent, approveOrder } from './api';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
 
const jobTypes = [
  { value: '', label: 'All types' },
  { value: 'curatenie', label: 'Cleaning' },
  { value: 'reparatii', label: 'Repairs' },
  { value: 'livrari', label: 'Deliveries' },
  { value: 'altele', label: 'Others' }
];

function OrderDemo({ userId }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    amount: '',
    beneficiary: userId,
    provider: '',
    jobType: '',
    hours: ''
  });
  const [msg, setMsg] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paid, setPaid] = useState(false);
  const [role, setRole] = useState('beneficiar');
  const [prestatorJobs, setPrestatorJobs] = useState([
    { id: 101, title: 'Furniture assembly at client\'s place', jobType: 'altele', hours: 4, amount: 350, description: 'I perform furniture assembly at home, quickly and neatly.', locatie: 'Cluj-Napoca', status: 'disponibil' },
    { id: 102, title: 'Electrical repairs', jobType: 'reparatii', hours: 2, amount: 200, description: 'I repair any electrical issues in the apartment.', locatie: 'București', status: 'disponibil' },
    { id: 103, title: 'General cleaning', jobType: 'curatenie', hours: 3, amount: 180, description: 'I clean apartments and offices, with my own materials.', locatie: 'Timișoara', status: 'disponibil' }
  ]);
  const [newService, setNewService] = useState({
    title: '',
    jobType: '',
    hours: '',
    amount: '',
    locatie: '',
    description: ''
  });
  const [lookingForServices, setLookingForServices] = useState([
    'General cleaning',
    'Roof repairs',
  ]);
  const [newLookingService, setNewLookingService] = useState('');
  // Dummy data for order management demo
  const [orders, setOrders] = useState([
    { _id: 'order1', title: 'Website redesign', amount: 1500, status: 'in_progress', beneficiary: 'user_beneficiary_1', provider: userId },
    { _id: 'order2', title: 'Mobile app development', amount: 5000, status: 'completed', beneficiary: userId, provider: 'user_provider_2' },
    { _id: 'order3', title: 'Logo design', amount: 500, status: 'accepted', beneficiary: 'user_beneficiary_3', provider: userId },
  ]);
  const [reviewData, setReviewData] = useState({
    comment: '',
    criteria: { quality: 5, communication: 5, punctuality: 5 }
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async e => {
    e.preventDefault();
    setMsg('');
    const paymentRes = await createPaymentIntent(Number(form.amount));
    if (!paymentRes.clientSecret) {
      setMsg(paymentRes.error || 'Error initiating payment');
      return;
    }
    setClientSecret(paymentRes.clientSecret);
    setShowPayment(true);
    const orderRes = await createOrder({ ...form, amount: Number(form.amount), paymentIntentId: paymentRes.clientSecret.split('_secret')[0] });
    if (orderRes._id) {
      setMsg('Order created! Continue to payment.');
    } else {
      setMsg(orderRes.error || 'Error creating order');
    }
  };

  const handleAddService = e => {
    e.preventDefault();
    setPrestatorJobs(jobs => [
      ...jobs,
      {
        id: Date.now(),
        ...newService,
        hours: Number(newService.hours),
        amount: Number(newService.amount),
        status: 'disponibil'
      }
    ]);
    setNewService({ title: '', jobType: '', hours: '', amount: '', locatie: '', description: '' });
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    // In a real app, this would be an API call to update the order status
    setOrders(currentOrders =>
      currentOrders.map(o => (o._id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleApproveAndPay = async (orderId) => {
    try {
      // API call to approve the order and release the payment
      await approveOrder(orderId, { ...reviewData, userId });
      handleUpdateOrderStatus(orderId, 'approved');
      setMsg('Lucrare aprobată și plată eliberată!');
    } catch (error) {
      setMsg('Eroare la aprobarea lucrării.');
      console.error('Approval error:', error);
    }
  };

  const isProvider = role === 'prestator';

  return (
    <div style={{border:'1px solid #ccc', padding:24, margin:10, maxWidth:500, borderRadius:16, background:'#fff', boxShadow:'0 2px 12px #0001'}}>
      <div style={{display:'flex', gap:16, marginBottom:24, justifyContent:'center'}}>
        <button onClick={()=>setRole('beneficiar')} style={{flex:1, minWidth:160, maxWidth:160, background:role==='beneficiar'?'#e9e4d8':'#f9f7f1', color:'#222', border:'none', borderRadius:8, padding:12, fontWeight:700, fontSize:16, cursor:'pointer', transition:'background 0.2s'}}>Looking for service</button>
        <button onClick={()=>setRole('prestator')} style={{flex:1, minWidth:160, maxWidth:160, background:role==='prestator'?'#e9e4d8':'#f9f7f1', color:'#222', border:'none', borderRadius:8, padding:12, fontWeight:700, fontSize:16, cursor:'pointer', transition:'background 0.2s'}}>Offering service</button>
      </div>
      {role==='beneficiar' && (
        <div style={{marginBottom:16}}>
          <b>Services I'm looking for:</b>
          <form onSubmit={e => {
            e.preventDefault();
            if (newLookingService.trim()) {
              setLookingForServices(list => [...list, newLookingService.trim()]);
              setNewLookingService('');
            }
          }} style={{display:'flex', flexDirection:'column', gap:8, background:'#f9f7f1', borderRadius:8, padding:12, marginBottom:12}}>
            <input placeholder="Service name" value={newLookingService} onChange={e=>setNewLookingService(e.target.value)} required />
            <button type="submit" style={{background:'#009975', color:'#fff', border:'none', borderRadius:8, padding:8, fontWeight:600, cursor:'pointer'}}>Add service</button>
          </form>
          <div style={{maxHeight:220, overflowY:'auto', background:'#f9f7f1', borderRadius:8, padding:8}}>
            {lookingForServices.length === 0 && <div style={{color:'#bbb'}}>You haven't added any service.</div>}
            {lookingForServices.map((s, idx) => (
              <div key={idx} style={{marginBottom:12, padding:12, background:'#e9e4d8', borderRadius:8, color:'#222'}}>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
      {role==='beneficiary' && (
        <form onSubmit={handleCreate} style={{display:'flex', flexDirection:'column', gap:12}}>
          <input name="title" placeholder="Job title" value={form.title} onChange={handleChange} required />
          <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
          <select name="jobType" value={form.jobType} onChange={handleChange} style={{padding:12, borderRadius:8}}>
            {jobTypes.map(j=>(<option key={j.value} value={j.value}>{j.label}</option>))}
          </select>
          <input name="hours" type="number" placeholder="Estimated hours" value={form.hours} onChange={handleChange} required />
          <input name="amount" type="number" placeholder="Amount (RON)" value={form.amount} onChange={handleChange} required />
          <input name="provider" placeholder="Provider ID" value={form.provider} onChange={handleChange} required />
          <button type="submit" style={{background:'#e9e4d8', color:'#222', fontWeight:700, fontSize:16, border:'none', borderRadius:8, padding:12, marginTop:8, cursor:'pointer'}}>Create order</button>
        </form>
      )}
      {role==='prestator' && (
        <div style={{marginBottom:16}}>
          <b>My services:</b>
          <form onSubmit={handleAddService} style={{display:'flex', flexDirection:'column', gap:8, background:'#f9f7f1', borderRadius:8, padding:12, marginBottom:12}}>
            <input placeholder="Title" value={newService.title} onChange={e=>setNewService(s=>({...s, title:e.target.value}))} required />
            <select value={newService.jobType} onChange={e=>setNewService(s=>({...s, jobType:e.target.value}))} required>
              <option value="">Service type</option>
              <option value="curatenie">Cleaning</option>
              <option value="reparatii">Repairs</option>
              <option value="livrari">Deliveries</option>
              <option value="altele">Others</option>
            </select>
            <input placeholder="Hours" type="number" value={newService.hours} onChange={e=>setNewService(s=>({...s, hours:e.target.value}))} required />
            <input placeholder="Price (RON)" type="number" value={newService.amount} onChange={e=>setNewService(s=>({...s, amount:e.target.value}))} required />
            <input placeholder="Location" value={newService.locatie} onChange={e=>setNewService(s=>({...s, locatie:e.target.value}))} required />
            <input placeholder="Description" value={newService.description} onChange={e=>setNewService(s=>({...s, description:e.target.value}))} required />
            <button type="submit" style={{background:'#009975', color:'#fff', border:'none', borderRadius:8, padding:8, fontWeight:600, cursor:'pointer'}}>Add service</button>
          </form>
          <div style={{maxHeight:220, overflowY:'auto', background:'#f9f7f1', borderRadius:8, padding:8}}>
            {prestatorJobs.length === 0 && <div style={{color:'#bbb'}}>You haven't added any service.</div>}
            {prestatorJobs.map(j => (
              <div key={j.id} style={{marginBottom:12, padding:12, background:'#e9e4d8', borderRadius:8, color:'#222', display:'flex', flexDirection:'column'}}>
                <b>{j.title}</b>
                <span style={{fontSize:13, color:'#666'}}>{j.jobType} | {j.hours} hours | {j.amount} RON | {j.locatie}</span>
                <div style={{marginTop:4}}>{j.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showPayment && clientSecret && !paid && (
        <div style={{marginTop:20, background:'#f9f7f1', padding:16, borderRadius:8}}>
          <b>Pay for your order:</b>
          <Elements options={{ clientSecret }} stripe={stripePromise}>
            <PaymentForm clientSecret={clientSecret} onSuccess={()=>{setPaid(true); setMsg('Payment successful')}} />
          </Elements>
        </div>
      )}

      {/* Order Management Section */}
      <div style={{ marginTop: 32, borderTop: '1px solid #eee', paddingTop: 24 }}>
        <h3 style={{ marginTop: 0, textAlign: 'center' }}>Management Comenzi ({role})</h3>
        {orders.filter(o => (isProvider ? o.provider === userId : o.beneficiary === userId)).map(order => (
          <div key={order._id} style={{ background: '#f9f7f1', padding: 16, borderRadius: 8, marginBottom: 12 }}>
            <b>{order.title}</b> - {order.amount} RON <span style={{ float: 'right', fontWeight: 'bold', color: '#009975' }}>{order.status}</span>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Provider Actions */}
              {isProvider && order.status === 'accepted' && <button onClick={() => handleUpdateOrderStatus(order._id, 'in_progress')}>Începe lucrul</button>}
              {isProvider && order.status === 'in_progress' && <button onClick={() => handleUpdateOrderStatus(order._id, 'completed')}>Marchează ca finalizat</button>}

              {/* Beneficiary Actions */}
              { !isProvider && order.status === 'completed' && (
                <div style={{ background: '#e9e4d8', padding: 12, borderRadius: 8 }}>
                  <p>Lucrarea a fost marcată ca finalizată. Ești mulțumit de rezultat?</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Object.keys(reviewData.criteria).map(criterion => (
                      <div key={criterion}>
                        <label style={{ textTransform: 'capitalize', display: 'block', marginBottom: 4 }}>{criterion}</label>
                        <select 
                          value={reviewData.criteria[criterion]} 
                          onChange={e => setReviewData(r => ({ ...r, criteria: { ...r.criteria, [criterion]: Number(e.target.value) } }))}
                          style={{ width: '100%', padding: 8 }}
                        >
                          {[5, 4, 3, 2, 1].map(val => <option key={val} value={val}>{val} ★</option>)}
                        </select>
                      </div>
                    ))}
                    <textarea value={reviewData.comment} onChange={e => setReviewData(r => ({ ...r, comment: e.target.value }))} placeholder="Lasă un comentariu..." />
                    <button onClick={() => handleApproveAndPay(order._id)} style={{ background: '#009975', color: 'white' }}>Aprobă și Eliberează Plata</button>
                  </div>
                </div>
              )}

              {/* General Info */}
              {order.status === 'approved' && <p style={{ color: 'green', fontWeight: 'bold' }}>Plata a fost eliberată.</p>}
              
              {/* Add to Calendar Button */}
              {(order.status === 'accepted' || order.status === 'in_progress') && 
                <a href={`http://localhost:5000/api/orders/${order._id}/calendar`} download style={{ textDecoration: 'none', textAlign: 'center', padding: '8px', background: '#ccc', color: '#222', borderRadius: '4px', fontSize: '14px' }}>Adaugă în Calendar</a>}
            </div>
          </div>
        ))}
        {orders.filter(o => (isProvider ? o.provider === userId : o.beneficiary === userId)).length === 0 && (
          <p style={{ textAlign: 'center', color: '#888' }}>Nu ai nicio comandă ca {role}.</p>
        )}
      </div>

      {paid && <div style={{marginTop:16, color:'#009975', fontWeight:700}}>Payment successful!</div>}
      <div style={{marginTop:8, color:'#009975'}}>{msg}</div>
    </div>
  );
}

export default OrderDemo;
