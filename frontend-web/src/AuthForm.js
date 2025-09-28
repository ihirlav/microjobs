import React, { useState } from 'react';
function AuthForm({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [modal, setModal] = useState(null); // 'google' | 'apple' | 'phone' | null

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    try {
      const data = await import('./api').then(api => api.loginUser(form.email, form.password));
      if (data.token) {
        localStorage.setItem('jwt', data.token);
        setMsg('Autentificare reușită!');
        if (onLogin) onLogin({ ...data.user, token: data.token });
      } else {
        setMsg(data.error || 'Autentificare eșuată');
      }
    } catch (err) {
      setMsg('Autentificare eșuată');
    }
  };

  const handleOAuthModal = (provider) => {
    setModal(provider);
  };

  const handleModalLogin = () => {
    setMsg('Login simulated!');
    setModal(null);
    if (onLogin) onLogin({ id: 'user123', email: form.email, provider: modal });
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth: 340, margin: '2rem auto', display:'flex', flexDirection:'column', gap:16, background:'#fff', borderRadius:12, boxShadow:'0 2px 12px #0001', padding:32}}>
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{padding:12, fontSize:16, borderRadius:8, border:'1px solid #ddd'}} />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={{padding:12, fontSize:16, borderRadius:8, border:'1px solid #ddd'}} />
      <button type="submit" style={{background:'#e9e4d8', color:'#222', fontWeight:700, fontSize:18, border:'none', borderRadius:8, padding:12, marginTop:8, cursor:'pointer'}}>Login</button>
      <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:8}}>
        <button type="button" onClick={()=>handleOAuthModal('google')} style={{background:'#fff', color:'#222', border:'1px solid #ddd', borderRadius:8, padding:10, fontWeight:600, cursor:'pointer'}}>Login with Google</button>
        <button type="button" onClick={()=>handleOAuthModal('apple')} style={{background:'#fff', color:'#222', border:'1px solid #ddd', borderRadius:8, padding:10, fontWeight:600, cursor:'pointer'}}>Login with Apple ID</button>
        <button type="button" onClick={()=>handleOAuthModal('phone')} style={{background:'#fff', color:'#222', border:'1px solid #ddd', borderRadius:8, padding:10, fontWeight:600, cursor:'pointer'}}>Login with Phone</button>
      </div>
      {modal && (
        <div style={{position:'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'#0008', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
          <div style={{background:'#fff', borderRadius:16, padding:32, minWidth:320, maxWidth:400, boxShadow:'0 2px 16px #0003', position:'relative'}}>
            <button onClick={()=>setModal(null)} style={{position:'absolute', top:12, right:16, background:'none', border:'none', fontSize:22, cursor:'pointer'}}>×</button>
            <h2 style={{marginTop:0}}>Login with {modal==='google'?'Google':modal==='apple'?'Apple ID':'Phone'}</h2>
            <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{padding:12, fontSize:16, borderRadius:8, border:'1px solid #ddd', marginBottom:12}} />
            {modal==='phone' && <input name="phone" placeholder="Phone number" style={{padding:12, fontSize:16, borderRadius:8, border:'1px solid #ddd', marginBottom:12}} />}
            <button onClick={handleModalLogin} style={{background:'#009975', color:'#fff', border:'none', borderRadius:8, padding:'12px 24px', fontWeight:700, fontSize:16, cursor:'pointer'}}>Continue</button>
          </div>
        </div>
      )}
      <div style={{marginTop:10, color:'#009975', textAlign:'center'}}>{msg}</div>
    </form>
  );
}

export default AuthForm;
