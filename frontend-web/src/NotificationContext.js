import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');

  const notify = (msg, t = 'info') => {
    setMessage(msg);
    setType(t);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {message && (
        <div style={{position:'fixed', top:24, right:24, background:type==='success'?'#009975':type==='error'?'#e74c3c':'#e9e4d8', color:'#222', padding:'16px 32px', borderRadius:12, boxShadow:'0 2px 12px #0002', fontWeight:700, zIndex:9999}}>
          {message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
