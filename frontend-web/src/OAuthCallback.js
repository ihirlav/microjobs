import { useEffect } from 'react';

function OAuthCallback({ onLogin }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('jwt', token);
      // Optionally decode token for user info
      if (onLogin) onLogin({ token });
    }
    // Redirect to home/joblist after login
    window.location.href = '/';
  }, [onLogin]);
  return <div>Logging in...</div>;
}

export default OAuthCallback;
