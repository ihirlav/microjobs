import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

function DataDeletionRequest({ userId }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('jwt');
      const res = await fetch('/api/data-deletion-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email })
      })
      if (!res.ok) throw new Error('Request failed');

      setMessage('Request sent. We will process it within 30 days.');
      setTimeout(() => handleClose(), 2000);
    } catch (error) {
      console.error('Data deletion request failed:', error);
      setMessage('Failed to send request. Please try again.');
    }
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleOpen}>Request Data Deletion</Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Request Data Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To request the deletion of your data, please enter your email address.
          </DialogContentText>
          <TextField autoFocus margin="dense" id="email" label="Email Address" type="email" fullWidth value={email} onChange={e => setEmail(e.target.value)} />
          {message && <p>{message}</p>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit Request</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DataDeletionRequest;