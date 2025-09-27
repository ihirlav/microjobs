import React, { useState } from 'react';
import PaymentForm from './PaymentForm';

// Receives service as prop: { title, description, amount, ... }
function ServiceDetails({ service, onClose }) {
  const [showPayment, setShowPayment] = useState(false);

  if (!service) return null;

  return (
    <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'#0008', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{background:'#fff', borderRadius:16, padding:32, minWidth:320, maxWidth:400, boxShadow:'0 2px 16px #0003', position:'relative'}}>
        <button onClick={onClose} style={{position:'absolute', top:12, right:16, background:'none', border:'none', fontSize:22, cursor:'pointer'}}>×</button>
        <h2 style={{marginTop:0}}>{service.title}</h2>
        <div style={{color:'#666', marginBottom:8}}>{service.location}</div>
        <div style={{marginBottom:16}}>{service.description}</div>
        <div style={{fontWeight:700, color:'#009975', marginBottom:16}}>Price: {service.amount} RON</div>
        {!showPayment ? (
          <button onClick={()=>setShowPayment(true)} style={{background:'#009975', color:'#fff', border:'none', borderRadius:8, padding:'12px 24px', fontWeight:700, fontSize:16, cursor:'pointer'}}>Order & Pay</button>
        ) : (
          <PaymentForm amount={service.amount} onSuccess={onClose} />
        )}
      </div>
    </div>
  );
}

export default ServiceDetails;
