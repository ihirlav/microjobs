import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FiscalDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      const res = await axios.get('/api/fiscal/report');
      setReport(res.data);
      setLoading(false);
    }
    fetchReport();
  }, []);

  if (loading) return <div>Loading fiscal report...</div>;
  if (!report) return <div>No data.</div>;

  return (
    <div style={{maxWidth:700, margin:'2rem auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 12px #0001', padding:32}}>
      <h2 style={{textAlign:'center', marginBottom:32}}>Fiscal Dashboard</h2>
      <div style={{display:'flex', gap:32, marginBottom:32}}>
        <div><b>Total Income:</b><br/> <span style={{color:'#009975', fontSize:22}}>{report.totalIncome} RON</span></div>
        <div><b>Commission:</b><br/> <span style={{color:'#e67e22', fontSize:22}}>{report.commission} RON</span></div>
        <div><b>Net:</b><br/> <span style={{color:'#222', fontSize:22}}>{report.net} RON</span></div>
      </div>
      <h4>Jobs (Paid/Completed):</h4>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr style={{background:'#f9f7f1'}}>
            <th style={{padding:8, border:'1px solid #eee'}}>Title</th>
            <th style={{padding:8, border:'1px solid #eee'}}>Amount</th>
            <th style={{padding:8, border:'1px solid #eee'}}>Status</th>
            <th style={{padding:8, border:'1px solid #eee'}}>Date</th>
          </tr>
        </thead>
        <tbody>
          {report.jobs.map(j => (
            <tr key={j._id}>
              <td style={{padding:8, border:'1px solid #eee'}}>{j.title}</td>
              <td style={{padding:8, border:'1px solid #eee'}}>{j.amount}</td>
              <td style={{padding:8, border:'1px solid #eee'}}>{j.status}</td>
              <td style={{padding:8, border:'1px solid #eee'}}>{new Date(j.updatedAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FiscalDashboard;
