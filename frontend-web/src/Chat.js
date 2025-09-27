import React, { useEffect, useRef, useState } from 'react';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new window.WebSocket('ws://localhost:5000');
    ws.current.onmessage = e => setMessages(msgs => [...msgs, e.data]);
    return () => ws.current.close();
  }, []);

  const send = (e) => {
    e && e.preventDefault();
    if (input && ws.current) {
      ws.current.send(input);
      setInput('');
    }
  };

  return (
    <div style={{
      width: '100%',
      height: '80vh',
      maxWidth: 700,
      margin: '0 auto',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 2px 16px #0001',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <div style={{flex:1, overflowY:'auto', padding:24, background:'#f9f7f1'}}>
        {messages.length === 0 && <div style={{color:'#bbb', textAlign:'center'}}>Niciun mesaj încă.</div>}
        {messages.map((m,i) => (
          <div key={i} style={{marginBottom:12, padding:12, background:'#e9e4d8', borderRadius:8, color:'#222', maxWidth:'80%'}}>{m}</div>
        ))}
      </div>
      <form onSubmit={send} style={{display:'flex', padding:16, background:'#e9e4d8', borderTop:'1px solid #eee'}}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Scrie un mesaj..."
          style={{flex:1, padding:12, fontSize:16, borderRadius:8, border:'1px solid #ddd', marginRight:12}}
        />
        <button type="submit" style={{background:'#222', color:'#fff', border:'none', borderRadius:8, padding:'0 24px', fontWeight:700, fontSize:16, cursor:'pointer'}}>Trimite</button>
      </form>
    </div>
  );
}

export default Chat;
