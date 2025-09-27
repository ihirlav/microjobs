import React, { useState } from 'react';
import AuthForm from './AuthForm';
import Chat from './Chat';
import OrderDemo from './OrderDemo';
import StripeWrapper from './StripeWrapper';
import { roCities } from './ro-cities';
import Profile from './Profile';
import AIDashboard from './AIDashboard';
import JobMap from './JobMap';
import { reserveJob } from './api';
import OAuthCallback from './OAuthCallback';
import FiscalDashboard from './FiscalDashboard';
import { NotificationProvider, useNotification } from './NotificationContext';

const beige = '#e9e4d8';
const cream = '#f9f7f1';

const menu = [
  { key: 'profile', label: 'Profil' },
  { key: 'joblist', label: 'Job List' },
  { key: 'order', label: 'Orders' },
  { key: 'auth', label: 'Autentificare' },
  { key: 'chat', label: 'Chat' },
  { key: 'ai', label: 'AI Dashboard' }
];

const allJobs = [
  { id: 1, title: 'Job disponibil 1' },
  { id: 2, title: 'Job disponibil 2' },
  { id: 3, title: 'Job disponibil 3' },
];

function App() {
  const [active, setActive] = useState('auth');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarJobs, setSidebarJobs] = useState(allJobs);
  const [sidebarFilter, setSidebarFilter] = useState({ jobType: '', status: '', location: '', minPrice: '', maxPrice: '', minHours: '', maxHours: '', keyword: '' });
  const [user, setUser] = useState(null);
  const [pendingJobId, setPendingJobId] = useState(null);
  const [reservationStatus, setReservationStatus] = useState('');
  const userId = "ID_USER_AUTENTIFICAT";

  const jobTypes = [
    { value: '', label: 'Toate tipurile' },
    { value: 'curatenie', label: 'Curățenie' },
    { value: 'reparatii', label: 'Reparații' },
    { value: 'livrari', label: 'Livrări' },
    { value: 'altele', label: 'Altele' }
  ];
  const statuses = [
    { value: '', label: 'Toate statusurile' },
    { value: 'disponibil', label: 'Disponibil' },
    { value: 'in_progress', label: 'În lucru' },
    { value: 'finalizat', label: 'Finalizat' }
  ];

  const filteredSidebarJobs = sidebarJobs.filter(j =>
    (!sidebarFilter.jobType || j.jobType === sidebarFilter.jobType) &&
    (!sidebarFilter.status || j.status === sidebarFilter.status) &&
    (!sidebarFilter.location || j.location === sidebarFilter.location) &&
    (!sidebarFilter.minPrice || j.amount >= Number(sidebarFilter.minPrice)) &&
    (!sidebarFilter.maxPrice || j.amount <= Number(sidebarFilter.maxPrice)) &&
    (!sidebarFilter.minHours || j.hours >= Number(sidebarFilter.minHours)) &&
    (!sidebarFilter.maxHours || j.hours <= Number(sidebarFilter.maxHours)) &&
    (!sidebarFilter.keyword || j.title.toLowerCase().includes(sidebarFilter.keyword.toLowerCase()) || (j.description && j.description.toLowerCase().includes(sidebarFilter.keyword.toLowerCase())))
  );

  // Simulez update la status job (in progress/terminat)
  const handleJobStatus = (jobId, status) => {
    setSidebarJobs(jobs => jobs.filter(j => j.id !== jobId));
    // În realitate, ar trebui update și în backend
  };

  return (
    <NotificationProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: cream }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: beige, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {menu.map(m => (
            <button key={m.key} onClick={() => setActive(m.key)} style={{ background: active === m.key ? '#fff' : beige, color: '#222', border: 'none', borderRadius: 8, padding: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', textAlign: 'left' }}>
              {m.label}
            </button>
          ))}
          <button onClick={() => setActive('fiscal')} style={{ background: active === 'fiscal' ? '#fff' : beige, color: '#222', border: 'none', borderRadius: 8, padding: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', textAlign: 'left' }}>Fiscal Dashboard</button>
        </div>
        {/* Main content */}
        <div style={{ flex: 1, padding: 32 }}>
          {active === 'profile' && <Profile userId={user?.id || userId} />}
          {active === 'joblist' && <JobMap user={user} onRequestLogin={jobId => {
            setPendingJobId(jobId);
            setActive('auth');
          }} onAutoReserve={async jobId => {
            setReservationStatus('Reserving job...');
            try {
              const token = user?.token || localStorage.getItem('jwt');
              const res = await reserveJob(jobId, token);
              if (res.success) setReservationStatus('Job reserved successfully!');
              else setReservationStatus(res.error || 'Reservation failed');
            } catch {
              setReservationStatus('Reservation failed');
            }
          }} reservationStatus={reservationStatus} />}
          {active === 'order' && <OrderDemo userId={user?.id || userId} />}
          {active === 'auth' && <AuthForm mode="login" onLogin={async u => {
            setUser(u);
            if (pendingJobId) {
              setActive('joblist');
              // Auto-reserve job after login
              if (u && u.token) {
                setReservationStatus('Reserving job...');
                try {
                  const res = await reserveJob(pendingJobId, u.token);
                  if (res.success) setReservationStatus('Job reserved successfully!');
                  else setReservationStatus(res.error || 'Reservation failed');
                } catch {
                  setReservationStatus('Reservation failed');
                }
              }
              setPendingJobId(null);
            }
          }} />}
          {active === 'chat' && <Chat userId={user?.id || userId} />}
          {active === 'ai' && <AIDashboard />}
          {active === 'oauth-callback' && <OAuthCallback onLogin={u=>{
            setUser(u);
            setActive('joblist');
          }} />}
          {active === 'fiscal' && <FiscalDashboard />}
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;
