import React, { useEffect, useRef, useState } from 'react';

function Chat({ userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [recipientId] = useState('ID_PROVIDER_1');
  const ws = useRef(null);

  useEffect(() => {
    if (!userId || !recipientId) return;

    // Fetch message history
    async function fetchHistory() {
      try {
        const token = localStorage.getItem('jwt');
        const res = await fetch(`/api/chat/${userId}/${recipientId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        setMessages(await res.json());
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    }
    fetchHistory();

    // Setup WebSocket
    ws.current = new window.WebSocket('ws://localhost:5000');
    ws.current.onopen = () => {
      // Identifică utilizatorul curent la serverul WebSocket
      ws.current.send(JSON.stringify({ type: 'identify', userId }));
    };
    ws.current.onmessage = async (e) => {
      let newMessageData;
      if (e.data instanceof Blob) {
        const text = await e.data.text();
        newMessageData = JSON.parse(text);
      } else {
        newMessageData = JSON.parse(e.data);
      }
      setMessages(msgs => [...msgs, newMessageData]);
    };
    return () => ws.current.close();
  }, [userId, recipientId]);

  const send = (e) => {
    e && e.preventDefault();
    if (input.trim() && ws.current) {
      const message = { type: 'message', to: recipientId, text: input };
      ws.current.send(JSON.stringify(message));
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
        {messages.map((m) => (
          <div 
            key={m._id} 
            style={{
              marginBottom: 12, padding: 12, background: m.from === userId ? '#009975' : '#e9e4d8', 
              color: m.from === userId ? 'white' : '#222', 
              borderRadius: 8, maxWidth: '80%', alignSelf: m.from === userId ? 'flex-end' : 'flex-start',
              marginLeft: m.from === userId ? 'auto' : 0
            }}>{m.text}</div>
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
