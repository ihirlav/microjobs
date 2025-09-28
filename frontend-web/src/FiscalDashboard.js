import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function FiscalDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReport() {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('jwt');
        const res = await fetch('/api/fiscal/report', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          throw new Error((await res.json()).error || 'Failed to fetch report');
        }
        setReport(await res.json());
      } catch (err) {
        setError(err.response?.data?.error || 'Nu s-au putut încărca datele. Asigură-te că ești autentificat.');
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  if (loading) return <div style={{ textAlign: 'center' }}>Loading fiscal report...</div>;
  if (error) return <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>;
  if (!report) return <div style={{ textAlign: 'center' }}>No data available.</div>;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Venituri Lunare' },
    },
  };

  const chartData = {
    labels: report.chartData.labels,
    datasets: [
      {
        label: 'Venituri (RON)',
        data: report.chartData.data,
        backgroundColor: 'rgba(0, 153, 117, 0.6)',
      },
    ],
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Title,Amount,Status,Date\n";
    report.jobs.forEach(row => {
      csvContent += `${row.title},${row.amount},${row.status},${new Date(row.updatedAt).toLocaleDateString()}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "fiscal_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{maxWidth:700, margin:'2rem auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 12px #0001', padding:32}}>
      <h2 style={{textAlign:'center', marginBottom:32}}>Fiscal Dashboard</h2>
      <div style={{display:'flex', gap:32, marginBottom:32}}>
        <div><b>Total Income:</b><br/> <span style={{color:'#009975', fontSize:22}}>{report.totalIncome} RON</span></div>
        <div><b>Commission (10%):</b><br/> <span style={{color:'#e67e22', fontSize:22}}>{report.commission.toFixed(2)} RON</span></div>
        <div><b>Net Income:</b><br/> <span style={{color:'#222', fontSize:22}}>{report.net.toFixed(2)} RON</span></div>
      </div>

      {/* Chart Section */}
      <div style={{ marginBottom: 32 }}>
        <Bar options={chartOptions} data={chartData} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4>Jobs (Paid/Completed):</h4>
        <button onClick={handleExportCSV} style={{ background: '#e9e4d8', color: '#222', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 700, cursor: 'pointer' }}>Export CSV</button>
      </div>
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
