import React, { useState, useEffect } from 'react';
import { fetchAIAgentStatus, approveAIPayout, declineAIPayout } from './api';

const AGENTS = [
  { key: 'matching', label: 'Matching & Pricing', icon: '🤖' },
  { key: 'marketing', label: 'Marketing', icon: '📈' },
  { key: 'invoicing', label: 'Invoicing & Accounting', icon: '🧾' },
  { key: 'legal', label: 'Legal & GDPR', icon: '⚖️' },
  { key: 'payments', label: 'Payments & Escrow', icon: '💳' },
  { key: 'support', label: 'Support & Disputes', icon: '🛟' },
];

// Dummy data for last actions/logs
const DUMMY_LOGS = {
  matching: [
    'Matched 5 jobs in Cluj-Napoca',
    'Sent notifications to 3 providers',
    'Adjusted price for 2 jobs'
  ],
  marketing: [
    'Created 3 Facebook ads',
    'Sent push to 12 inactive users'
  ],
  invoicing: [
    'Generated 8 invoices',
    'Calculated Dubai tax for 1 provider'
  ],
  legal: [
    'Checked new EU regulation',
    'Processed 2 GDPR requests'
  ],
  payments: [
    'Released escrow for 4 jobs',
    'Flagged 1 suspicious transaction'
  ],
  support: [
    'Auto-replied to 7 tickets',
    'Escalated 1 dispute to human team'
  ]
};

function AIDashboard() {
  const [logs, setLogs] = useState(DUMMY_LOGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const data = await fetchAIAgentStatus();
        setLogs(data.logs);
      } catch (e) {}
      setLoading(false);
    }
    loadLogs();
  }, []);

  const handleApprove = async () => {
    setLoading(true);
    await approveAIPayout();
    const data = await fetchAIAgentStatus();
    setLogs(data.logs);
    setLoading(false);
  };
  const handleDecline = async () => {
    setLoading(true);
    await declineAIPayout();
    const data = await fetchAIAgentStatus();
    setLogs(data.logs);
    setLoading(false);
  };

  return (
    <div style={{maxWidth:700, margin:'2rem auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 12px #0001', padding:32}}>
      <h2 style={{textAlign:'center', marginBottom:32}}>AI Automation Dashboard</h2>
      {AGENTS.map(agent => (
        <div key={agent.key} style={{display:'flex', alignItems:'flex-start', gap:16, marginBottom:32, borderBottom:'1px solid #eee', paddingBottom:16}}>
          <div style={{fontSize:36}}>{agent.icon}</div>
          <div style={{flex:1}}>
            <b style={{fontSize:18}}>{agent.label}</b>
            <ul style={{margin:'8px 0 0 16px', color:'#444'}}>
              {logs[agent.key]?.map((log, idx) => (
                <li key={idx}>{log}</li>
              ))}
            </ul>
          </div>
          {/* Example approve/decline for critical actions */}
          {agent.key === 'payments' && (
            <div style={{display:'flex', flexDirection:'column', gap:8}}>
              <button disabled={loading} onClick={handleApprove} style={{background:'#009975', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, cursor:'pointer'}}>Approve payout</button>
              <button disabled={loading} onClick={handleDecline} style={{background:'#e9e4d8', color:'#222', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, cursor:'pointer'}}>Decline</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default AIDashboard;
