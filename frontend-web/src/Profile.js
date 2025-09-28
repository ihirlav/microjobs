import React, { useState, Suspense, lazy } from 'react';
import { useNotification } from './NotificationContext';
 
const RecommendedJobs = lazy(() => import('./components/RecommendedJobs'));
const DataDeletionRequest = lazy(() => import('./components/DataDeletionRequest'));

function Profile({ userId, user }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const notify = useNotification();
  const [editMode, setEditMode] = useState(false);
  const [editProfile, setEditProfile] = useState({});

  React.useEffect(() => {
    async function fetchProfile() {
      const id = userId || (user && user._id);
      if (!id || id === 'ID_USER_AUTENTIFICAT') {
        setError('User not authenticated.');
        setProfile(null);
        return;
      }
      try {
        const res = await fetch(`/api/users/${id}`);
        if (res.status === 404) {
          setError('Profile not found.');
          setProfile(null);
          return;
        }
        const data = await res.json();
        setProfile(data);
        setEditProfile(data);
        setError(null);
      } catch {
        setError('Failed to load profile.');
        setProfile(null);
      }
    }
    if (userId || (user && user._id)) fetchProfile();
  }, [userId, user]);

  const handleEditChange = e => setEditProfile(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleProfileEdit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${profile._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfile)
      });
      if (res.ok) {
        setProfile(editProfile);
        setEditMode(false);
        notify('Profile updated!', 'success');
      } else {
        notify('Profile update failed!', 'error');
      }
    } catch {
      notify('Profile update failed!', 'error');
    }
  };

  const handleStripeConnect = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch('/api/payments/create-connect-account', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const { url } = await res.json();
      // Redirecționează utilizatorul către Stripe pentru onboarding
      window.location.href = url;
    } catch (error) {
      notify('Failed to connect to Stripe.', 'error');
    }
  };

  return (
    <div style={{maxWidth:420, margin:'2rem auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 12px #0001', padding:32, textAlign:'center'}}>
      {error ? (
        <div style={{color:'red', fontWeight:700, margin:'2rem 0'}}>{error}</div>
      ) : !profile ? (
        <div>Loading profile...</div>
      ) : profile ? (
        <>
          <img src={profile.photo || 'https://randomuser.me/api/portraits/men/32.jpg'} alt="profile" style={{width:100, height:100, borderRadius:'50%', objectFit:'cover', marginBottom:16}} />
          <h2 style={{margin:0}}>{profile.firstName} {profile.lastName}</h2>
          <div style={{color:'#666', marginBottom:8}}>{profile.location} {profile.age ? `• ${profile.age} years` : ''}</div>
          <div style={{color:'#666', marginBottom:8}}>{profile.email} {profile.phone && <>• {profile.phone}</>}</div>

          {/* Secțiune Gamificare */}
          <div style={{ margin: '16px 0' }}>
            <div style={{ fontWeight: 'bold' }}>Nivel {profile.level || 1}</div>
            <div style={{ background: '#e9e4d8', borderRadius: '8px', overflow: 'hidden', marginTop: '4px' }}>
              <div style={{ width: `${(profile.xp || 0) % 100}%`, background: '#009975', color: 'white', padding: '2px 0', fontSize: '12px' }}>
                {profile.xp || 0} / {(profile.level || 1) * 100} XP
              </div>
            </div>
          </div>
          
          {/* Afișare badge-uri */}
          <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {profile.badges?.map(badge => <span key={badge} style={{ background: '#e9e4d8', color: '#333', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{badge}</span>)}
            {profile.kycStatus === 'verified' && <span style={{ background: '#009975', color: '#fff', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>✓ ID Verificat</span>}
          </div>

          {/* Buton pentru Stripe Connect (doar pentru prestatori) */}
          {profile.role === 'provider' && (
            <div style={{ margin: '16px 0' }}>
              <button onClick={handleStripeConnect} style={{ background: '#6772e5', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                {profile.stripeAccountId ? 'Gestionează Contul de Plăți' : 'Configurează Plățile (Stripe)'}
              </button>
            </div>
          )}

          <button onClick={()=>setEditMode(true)} style={{margin:'16px 0', background:'#e9e4d8', color:'#222', border:'none', borderRadius:8, padding:'10px 24px', fontWeight:700, fontSize:16, cursor:'pointer'}}>Edit Profile</button>
          {editMode && (
            <form onSubmit={handleProfileEdit} style={{background:'#fff', borderRadius:12, padding:24, margin:'16px 0', boxShadow:'0 2px 12px #0002', display:'flex', flexDirection:'column', gap:12}}>
              <input name="firstName" value={editProfile.firstName || ''} onChange={handleEditChange} placeholder="First Name" style={{padding:10, borderRadius:8, border:'1px solid #ccc'}} required />
              <input name="lastName" value={editProfile.lastName || ''} onChange={handleEditChange} placeholder="Last Name" style={{padding:10, borderRadius:8, border:'1px solid #ccc'}} required />
              <input name="email" value={editProfile.email || ''} onChange={handleEditChange} placeholder="Email" style={{padding:10, borderRadius:8, border:'1px solid #ccc'}} required />
              <input name="phone" value={editProfile.phone || ''} onChange={handleEditChange} placeholder="Phone" style={{padding:10, borderRadius:8, border:'1px solid #ccc'}} />
              <input name="photo" value={editProfile.photo || ''} onChange={handleEditChange} placeholder="Photo URL" style={{padding:10, borderRadius:8, border:'1px solid #ccc'}} />
              <input name="location" value={editProfile.location || ''} onChange={handleEditChange} placeholder="Location" style={{padding:10, borderRadius:8, border:'1px solid #ccc'}} />
              <input name="cvUrl" value={editProfile.cvUrl || ''} onChange={handleEditChange} placeholder="CV URL" style={{padding:10, borderRadius:8, border:'1px solid #ccc'}} />
              <textarea name="skills" value={editProfile.skills?.join(', ') || ''} onChange={e => setEditProfile(p => ({ ...p, skills: e.target.value.split(',').map(s => s.trim()) }))} placeholder="Skills (separate by comma)" style={{padding:10, borderRadius:8, border:'1px solid #ccc', minHeight: 60}} />
              <button type="submit" style={{background:'#009975', color:'#fff', border:'none', borderRadius:8, padding:'10px 24px', fontWeight:700, fontSize:16, cursor:'pointer'}}>Save</button>
              <button type="button" onClick={()=>setEditMode(false)} style={{background:'#eee', color:'#222', border:'none', borderRadius:8, padding:'10px 24px', fontWeight:700, fontSize:16, cursor:'pointer'}}>Cancel</button>
            </form>
          )}

          {/* Secțiune Portofoliu */}
          <div style={{ textAlign: 'left', marginTop: 24 }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: 8 }}>Portofoliu</h3>
            {profile.portfolio?.length > 0 ? profile.portfolio.map((item, index) => (
              <div key={index} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                {item.imageUrl && <img src={item.imageUrl} alt={item.title} style={{ width: '100%', borderRadius: 8, marginBottom: 8 }} />}
                <b>{item.title}</b>
                <p style={{ margin: '4px 0 0', color: '#555' }}>{item.description}</p>
              </div>
            )) : <p style={{ color: '#888' }}>Niciun element în portofoliu.</p>}
          </div>

          {/* Adăugăm componenta de recomandări */}
          <Suspense fallback={<div>Loading extras...</div>}>
            <RecommendedJobs />
            <DataDeletionRequest userId={profile._id} />
          </Suspense>
          
        </>
      ) : null}
    </div>
  );
}

export default Profile;
