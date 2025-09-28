import React, { useState, useEffect } from 'react';

function RecommendedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const token = localStorage.getItem('jwt');
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await fetch('/api/users/recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        setJobs(await res.json());
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

  if (loading) return <p>Loading recommendations...</p>;
  if (jobs.length === 0) return null; // Nu afișa nimic dacă nu există recomandări

  return (
    <div style={{ textAlign: 'left', marginTop: 24, background: '#f9f7f1', padding: '16px', borderRadius: '12px' }}>
      <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: 8 }}>Joburi Recomandate pentru Tine</h3>
      {jobs.map(job => (
        <div key={job._id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #e9e4d8' }}>
          <b>{job.title}</b> - <span style={{ color: '#009975' }}>{job.amount} RON</span>
          <p style={{ margin: '4px 0 0', color: '#555' }}>Creat de: {job.beneficiary?.firstName}</p>
        </div>
      ))}
    </div>
  );
}

export default RecommendedJobs;