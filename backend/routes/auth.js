const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'Email deja folosit' });
    const hashed = await bcrypt.hash(password, 10);
    user = new User({ firstName, lastName, email, password: hashed, role });
    await user.save();
    res.json({ message: 'Cont creat cu succes' });
  } catch (err) {
    res.status(500).json({ error: 'Eroare server' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Email sau parolă greșită' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Email sau parolă greșită' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Eroare server' });
  }
});

module.exports = router;
