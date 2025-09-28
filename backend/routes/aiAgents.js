const express = require('express');
const router = express.Router();
const AgentLog = require('../models/AgentLog');

const AGENTS = ['matching', 'marketing', 'invoicing', 'legal', 'payments', 'support'];

// GET /api/ai-agents/status
router.get('/status', async (req, res) => {
  try {
    const logsByAgent = {};
    for (const agent of AGENTS) {
      const logs = await AgentLog.find({ agent }).sort({ timestamp: -1 }).limit(5);
      logsByAgent[agent] = logs.map(log => log.message);
    }
    res.json({ logs: logsByAgent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch agent logs.' });
  }
});

// POST /api/ai-agents/payments/approve
router.post('/payments/approve', (req, res) => {
  // TODO: implement payout approval logic
  new AgentLog({ agent: 'payments', message: 'Payout approved by admin at ' + new Date().toISOString() }).save();
  res.json({ success: true });
});

// POST /api/ai-agents/payments/decline
router.post('/payments/decline', (req, res) => {
  // TODO: implement payout decline logic
  new AgentLog({ agent: 'payments', message: 'Payout declined by admin at ' + new Date().toISOString() }).save();
  res.json({ success: true });
});

module.exports = router;
