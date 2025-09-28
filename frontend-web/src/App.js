import React, { useState, Suspense, lazy } from 'react';
import { reserveJob } from './api';
import { NotificationProvider } from './NotificationContext';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, CircularProgress, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import MenuIcon from '@mui/icons-material/Menu';
import { lightTheme, darkTheme } from './theme';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ListAlt from '@mui/icons-material/ListAlt';
import ShoppingCart from '@mui/icons-material/ShoppingCart';
import Login from '@mui/icons-material/Login';
import ChatIcon from '@mui/icons-material/Chat';
import Assessment from '@mui/icons-material/Assessment';
const OnboardingAssistant = lazy(() => import('./components/OnboardingAssistant'));

// Încărcăm componentele "leneș" (lazy loading) pentru a îmbunătăți performanța inițială
const AuthForm = lazy(() => import('./AuthForm'));
const Chat = lazy(() => import('./Chat'));
const OrderDemo = lazy(() => import('./OrderDemo'));
const Profile = lazy(() => import('./Profile'));
const JobMap = lazy(() => import('./JobMap'));
const OAuthCallback = lazy(() => import('./OAuthCallback'));
const FiscalDashboard = lazy(() => import('./FiscalDashboard'));

const menu = [
  { key: 'profile', label: 'Profile', icon: <AccountCircle /> },
  { key: 'joblist', label: 'Job list', icon: <ListAlt /> },
  { key: 'order', label: 'Order', icon: <ShoppingCart /> },
  { key: 'auth', label: 'Auth', icon: <Login /> },
  { key: 'chat', label: 'Chat', icon: <ChatIcon /> }
];

function App() {
  const { t, i18n } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState('auth');
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [reservationStatus, setReservationStatus] = useState('');
  const userId = "ID_USER_AUTENTIFICAT";

  const handleLogin = (loggedInUser) => {
    // Stocăm token-ul și actualizăm starea utilizatorului
    localStorage.setItem('jwt', loggedInUser.token);
    setUser(loggedInUser);
    setActive('profile'); // Redirecționăm către profil după login
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <NotificationProvider>
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
          <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'primary.main' }}>
            <Toolbar>
              <IconButton color="inherit" aria-label="open drawer" onClick={() => setDrawerOpen(!drawerOpen)} edge="start">
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                MicroJobs
              </Typography>
              <button onClick={() => i18n.changeLanguage('ro')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: i18n.language === 'ro' ? 'bold' : 'normal' }}>RO</button>
              <span style={{color: 'white'}}>|</span>
              <button onClick={() => i18n.changeLanguage('en')} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', fontWeight: i18n.language === 'en' ? 'bold' : 'normal' }}>EN</button>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="persistent"
            anchor="left"
            open={drawerOpen}
            sx={{
              width: 240,
              flexShrink: 0,
              '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', backgroundColor: 'background.paper', top: '64px' },
            }}
          >
            <List>
              {menu.map((item) => (
                <ListItem key={item.key} disablePadding>
                  <ListItemButton selected={active === item.key} onClick={() => setActive(item.key)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              ))}
              <Divider />
              <ListItem key="fiscal" disablePadding>
                <ListItemButton selected={active === 'fiscal'} onClick={() => setActive('fiscal')}>
                  <ListItemIcon><Assessment /></ListItemIcon>
                  <ListItemText primary={t('menu.fiscal_dashboard')} />
                </ListItemButton>
              </ListItem>
            </List>
          </Drawer>
          {/* Main content */}
          <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '64px', transition: 'margin 195ms cubic-bezier(0.4, 0, 0.6, 1) 0ms', marginLeft: drawerOpen ? '240px' : 0 }}>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>}>
              {active === 'profile' && <Profile userId={user?.id || userId} user={user} />}
              {active === 'joblist' && <JobMap user={user} onRequestLogin={() => setActive('auth')} onAutoReserve={async jobId => {
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
              {active === 'order' && <OrderDemo userId={user?.id || userId} userRole={user?.role} />}
              {active === 'auth' && <AuthForm onLogin={handleLogin} />}
              {active === 'chat' && <Chat userId={user?.id || userId} />}
              {active === 'oauth-callback' && <OAuthCallback onLogin={u=>{
                setUser(u);
                setActive('joblist');
              }} />}
              {active === 'fiscal' && <FiscalDashboard />}
            </Suspense>
          </Box>
          {/* Afișăm asistentul dacă utilizatorul este logat și nu a finalizat onboarding-ul */}
          {user && !user.onboardingCompleted && (
            <Suspense fallback={<div />}>
              <OnboardingAssistant user={user} onComplete={() => setUser(u => ({ ...u, onboardingCompleted: true }))} />
            </Suspense>
          )}
        </Box>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
