import React, { useState } from 'react';
import { useNotification } from './NotificationContext';
import { providerReview } from './api';

// Example profile data (should be fetched from backend in real app)
const userProfile = {
  lastName: 'Popescu',
  firstName: 'Ion',
  age: 32,
  photo: 'https://randomuser.me/api/portraits/men/32.jpg',
  location: 'Cluj-Napoca',
  reviews: [
    { id: 1, author: 'Maria Ionescu', rating: 5, text: 'Very reliable and punctual!' },
    { id: 2, author: 'Andrei Vasilescu', rating: 4, text: 'Did a good job, recommend.' }
  ],
  servicesOffered: [
    'Appliance installation',
    'Electrical repairs',
    'Furniture assembly'
  ],
  servicesLookingFor: [
    'General cleaning',
    'Roof repairs',
  ]
};

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

  return (
    <div style={{maxWidth:420, margin:'2rem auto', background:'#fff', borderRadius:16, boxShadow:'0 2px 12px #0001', padding:32, textAlign:'center'}}>
      {error ? (
        <div style={{color:'red', fontWeight:700, margin:'2rem 0'}}>{error}</div>
      ) : profile ? (
        <>
          <img src={profile.photo || 'https://randomuser.me/api/portraits/men/32.jpg'} alt="profile" style={{width:100, height:100, borderRadius:'50%', objectFit:'cover', marginBottom:16}} />
          <h2 style={{margin:0}}>{profile.firstName} {profile.lastName}</h2>
          <div style={{color:'#666', marginBottom:8}}>{profile.location} {profile.age ? `• ${profile.age} years` : ''}</div>
          <div style={{color:'#666', marginBottom:8}}>{profile.email} {profile.phone && <>• {profile.phone}</>}</div>
          <button onClick={()=>setEditMode(true)} style={{margin:'16px 0', background:'#e9e4d8', color:'#222', border:'none', borderRadius:8, padding:'10px 24px', fontWeight:700, fontSize:16, cursor:'pointer'}}>Edit Profile</button>
          {editMode && (
            <form onSubmit={handleProfileEdit} style={{background:'#fff', borderRadius:12, padding:24, margin:'16px 0', boxShadow:'0 2px 12px #0002', display:'flex', flexDirection:'column', gap:12}}>
              <input name="firstName" value={editProfile.firstName || ''} onChange={handleEditChange} placeholder="First Name" style={{padding:10, borderRadius:8, border:'1px solid #ccc'}} required />
              <input name="lastName" value={editProfile.lastName || ''} onChange={handleEditChange} placeholder="Last Name" style={{padding:10, borderRadius:8, border:'1px solid #ccc'}} required />
              <input name="email" value={editProfile.email || ''} onChange={handleEditChange} placeholder="Email" style={{padding:10, borderRadius:8, border:'1px solid #ccc'}} required />
              <input name="phone" value={editProfile.phone || ''} onChange={handleEditChange} placeholder="Phone" style={{padding:10, borderRadius:8, border:'1px solid #ccc'}} />
              <input name="photo" value={editProfile.photo || ''} onChange={handleEditChange} placeholder="Photo URL" style={{padding:10, borderRadius:8, border:'1px solid #ccc'}} />
              <input name="location" value={editProfile.location || ''} onChange={handleEditChange} placeholder="Location" style={{padding:10, borderRadius:8, border:'1px solid #ccc'}} />
              <button type="submit" style={{background:'#009975', color:'#fff', border:'none', borderRadius:8, padding:'10px 24px', fontWeight:700, fontSize:16, cursor:'pointer'}}>Save</button>
              <button type="button" onClick={()=>setEditMode(false)} style={{background:'#eee', color:'#222', border:'none', borderRadius:8, padding:'10px 24px', fontWeight:700, fontSize:16, cursor:'pointer'}}>Cancel</button>
            </form>
          )}
        </>
      ) : <div>Loading profile...</div>}
    </div>
  );
}

export default Profile;
