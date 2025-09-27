import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchPublicJobs } from './api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';
import { reserveJob } from './api';
import { useNotification } from './NotificationContext';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Dummy jobs for demo; in real app, fetch from backend
const DUMMY_JOBS = [
  { id: 1, title: 'General cleaning', type: 'Cleaning', price: 200, location: 'Cluj-Napoca', lat: 46.77, lng: 23.59, rating: 4.8 },
  { id: 2, title: 'Furniture assembly', type: 'Repairs', price: 350, location: 'București', lat: 44.43, lng: 26.10, rating: 4.7 },
  { id: 3, title: 'Roof repairs', type: 'Repairs', price: 500, location: 'Timișoara', lat: 45.75, lng: 21.23, rating: 4.9 }
];

function JobMap({ user, onRequestLogin, onAutoReserve, reservationStatus }) {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState({ type: '', minPrice: '', maxPrice: '', minRating: '' });
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [reservedJobId, setReservedJobId] = useState(null);
  const [invoiceJobId, setInvoiceJobId] = useState(null);
  const notify = useNotification();

  useEffect(() => {
    async function loadJobs() {
      try {
        const data = await fetchPublicJobs();
        setJobs(data);
      } catch {
        setJobs([]);
      }
    }
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter(j =>
    (!filter.type || j.type === filter.type) &&
    (!filter.minPrice || j.price >= Number(filter.minPrice)) &&
    (!filter.maxPrice || j.price <= Number(filter.maxPrice)) &&
    (!filter.minRating || j.rating >= Number(filter.minRating))
  );

  const handleAcceptJob = async (jobId) => {
    if (!user) onRequestLogin(jobId);
    else if (onAutoReserve) {
      setShowPayment(false);
      setClientSecret('');
      setReservedJobId(null);
      await onAutoReserve(jobId);
      notify('Job reserved! Continue with payment.', 'success');
      // După rezervare, inițiază plata
      try {
        const token = user.token || localStorage.getItem('jwt');
        const res = await fetch(`/api/orders/${jobId}/pay`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
          setShowPayment(true);
          setReservedJobId(jobId);
          notify('Payment initiated. Complete payment to confirm job.', 'info');
        }
      } catch {
        notify('Payment initiation failed.', 'error');
      }
    }
  };

  // După plată cu succes, permite descărcarea facturii
  const handleDownloadInvoice = async (jobId) => {
    try {
      const response = await fetch(`/api/orders/${jobId}/invoice`, {
        method: 'GET',
        headers: { 'Accept': 'application/pdf' }
      });
      if (!response.ok) throw new Error('Failed to fetch invoice');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${jobId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      notify('Invoice downloaded!', 'info');
    } catch (err) {
      notify('Invoice download failed!', 'error');
    }
  };

  return (
    <div style={{maxWidth:900, margin:'2rem auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 12px #0001', padding:32}}>
      <h2 style={{textAlign:'center'}}>Job Map (Public Access)</h2>
      <div style={{marginBottom:12, color:'#009975', textAlign:'center', fontWeight:600}}>{reservationStatus}</div>
      <div style={{display:'flex', gap:16, marginBottom:24}}>
        <select value={filter.type} onChange={e=>setFilter(f=>({...f, type:e.target.value}))}>
          <option value="">All types</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Repairs">Repairs</option>
        </select>
        <input type="number" placeholder="Min price" value={filter.minPrice} onChange={e=>setFilter(f=>({...f, minPrice:e.target.value}))} />
        <input type="number" placeholder="Max price" value={filter.maxPrice} onChange={e=>setFilter(f=>({...f, maxPrice:e.target.value}))} />
        <input type="number" placeholder="Min rating" value={filter.minRating} onChange={e=>setFilter(f=>({...f, minRating:e.target.value}))} />
      </div>
      <div style={{height:400, background:'#e9e4d8', borderRadius:12, marginBottom:24, overflow:'hidden'}}>
        <MapContainer center={[46.77, 23.59]} zoom={6} style={{height:'100%', width:'100%'}}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredJobs.map(job => (
            <Marker key={job._id || job.id} position={[job.lat, job.lng]}>
              <Popup>
                <b>{job.title}</b><br/>
                {job.type} | {job.amount || job.price} RON<br/>
                {job.location} | ★ {job.rating}<br/>
                <button style={{marginTop:8, background:'#009975', color:'#fff', border:'none', borderRadius:8, padding:'4px 12px', fontWeight:700, cursor:'pointer'}} onClick={()=>handleAcceptJob(job._id || job.id)}>Accept job</button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {showPayment && clientSecret && (
        <div style={{margin:'24px auto', maxWidth:400}}>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm onSuccess={()=>{setShowPayment(false); notify('Payment successful!', 'success');}} />
          </Elements>
        </div>
      )}
      {reservedJobId && !showPayment && (
        <div style={{margin:'24px auto', maxWidth:400, textAlign:'center'}}>
          <button style={{background:'#009975', color:'#fff', border:'none', borderRadius:8, padding:'12px 24px', fontWeight:700, fontSize:16, cursor:'pointer'}} onClick={()=>{handleDownloadInvoice(reservedJobId); notify('Invoice downloaded!', 'info');}}>Download Invoice (PDF)</button>
        </div>
      )}
      <ul style={{listStyle:'none', padding:0}}>
        {filteredJobs.map(job => (
          <li key={job.id} style={{background:'#f9f7f1', borderRadius:8, marginBottom:12, padding:16, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div>
              <b>{job.title}</b> <span style={{color:'#009975'}}>{job.price} RON</span><br/>
              <span style={{fontSize:13, color:'#666'}}>{job.type} | {job.location} | ★ {job.rating}</span>
            </div>
            <div style={{display:'flex', gap:8}}>
              <button style={{background:'#009975', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, cursor:'pointer'}} onClick={()=>{
                if (!user) onRequestLogin(job.id);
                else if (onAutoReserve) onAutoReserve(job.id);
              }}>Accept job</button>
              <button style={{background:'#e9e4d8', color:'#222', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, cursor:'pointer'}} onClick={()=>{
                if (!user) onRequestLogin(job.id);
                else alert('Contact provider! (simulate contact)');
              }}>Contact provider</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JobMap;
