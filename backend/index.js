require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const authRoutes = require('./routes/auth');
const paymentsRoutes = require('./routes/payments');
const ordersRoutes = require('./routes/orders');
const aiAgentsRoutes = require('./routes/aiAgents');
const fiscalRoutes = require('./routes/fiscal');
const Review = require('./models/Review');
const User = require('./models/User');

// AI Agents automation (full automation for jobs, payments, invoices, legal, support)
const { runAllAgents } = require('./ai_agents');
const cron = require('node-cron');
const schedule = require('node-schedule');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Example route
app.get('/', (req, res) => {
  res.send('MicroJobs backend API');
});

// Test connection route
app.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// Authentication routes
app.use('/api/auth', authRoutes);
// Payment routes
app.use('/api/payments', paymentsRoutes);
// Orders routes
app.use('/api/orders', ordersRoutes);
// AI Agents routes
app.use('/api/ai-agents', aiAgentsRoutes);
// Fiscal routes
app.use('/api/fiscal', fiscalRoutes);

// User profile route
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
app.put('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Ensure req.user is set if JWT is present (for /orders/:id/reserve)
const jwt = require('jsonwebtoken');
app.use((req, res, next) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET || 'devsecret');
    } catch {}
  }
  next();
});

// HTTP & WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('connection', ws => {
  ws.on('message', message => {
    // Broadcast către toți clienții conectați
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

// Run all agents every 5 minutes (can be adjusted per agent)
cron.schedule('*/5 * * * *', async () => {
  console.log('[AI Agents] Running all automation agents...');
  await runAllAgents();
  console.log('[AI Agents] All agents finished.');
});

// Review automat după 48h dacă nu există review
schedule.scheduleJob('0 * * * *', async () => {
  const twoDaysAgo = new Date(Date.now() - 48*60*60*1000);
  const jobs = await Order.find({ status: 'completed', updatedAt: { $lte: twoDaysAgo } });
  for (const job of jobs) {
    const existing = await Review.findOne({ order: job._id });
    if (!existing) {
      await Review.create({ order: job._id, reviewer: 'system', rating: 5, text: 'Auto 5 stars (no dispute reported)' });
    }
  }
});

// Passport.js setup (dezactivat temporar pentru dev)
/*
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple');

app.use(session({ secret: process.env.SESSION_SECRET || 'devsecret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // TODO: create/find user in DB
  return done(null, { id: profile.id, email: profile.emails[0].value, name: profile.displayName, provider: 'google' });
}));

passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  keyID: process.env.APPLE_KEY_ID,
  privateKey: process.env.APPLE_PRIVATE_KEY,
  callbackURL: '/api/auth/apple/callback'
}, (accessToken, refreshToken, idToken, profile, done) => {
  // TODO: create/find user in DB
  return done(null, { id: profile.id, email: profile.email, name: profile.name, provider: 'apple' });
}));

app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  // Generate JWT and redirect to frontend with token
  const token = jwt.sign({ id: req.user.id, email: req.user.email, name: req.user.name, provider: 'google' }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-callback?token=${token}`);
});

app.get('/api/auth/apple', passport.authenticate('apple'));
app.post('/api/auth/apple/callback', passport.authenticate('apple', { failureRedirect: '/login' }), (req, res) => {
  // Generate JWT and redirect to frontend with token
  const token = jwt.sign({ id: req.user.id, email: req.user.email, name: req.user.name, provider: 'apple' }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-callback?token=${token}`);
});
*/

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
