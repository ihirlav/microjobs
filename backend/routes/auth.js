const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AgentLog = require('../models/AgentLog');
const { authenticate } = require('../middleware/auth');

const router = express.Router();


// Register
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'Email deja folosit' });
    const hashed = await bcrypt.hash(password, 10);
    user = new User({ firstName, lastName, email, password: hashed, role });
    logger.info(`New user registered: ${email}`);
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
    logger.info(`Login attempt for email: ${email}`)
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Email sau parolă greșită' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role } });
    logger.info(`User logged in: ${email}`);
  } catch (err) {
    res.status(500).json({ error: 'Eroare server' });
  }


});


router.post('/data-deletion-request', authenticate, async (req, res) => {
    const { email } = req.body;
    const userId = req.user.id; // Assuming you have middleware to authenticate the user and attach the user object to the request

    try {
        // Create a new data deletion request
        const deletionRequest = new DataDeletionRequest({

            userId: userId,
            email: email,
            //requestDate: Date.now(), //not needed. the model already takes care
            status: 'pending'
        });

        // Save the request to the database
        await deletionRequest.save();

        logger.info(`Data deletion requested for user: ${email}`);
        // Log pentru AI Dashboard
        new AgentLog({ agent: 'legal', message: `Processed GDPR data deletion request for ${email}` }).save();

        res.json({ message: 'Data deletion request submitted successfully' });
    } catch (error) {
        console.error('Data deletion request error', error);
        res.status(500).json({ message: 'Failed to submit data deletion request' });
    }
});



module.exports = router;
