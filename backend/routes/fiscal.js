const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Fiscal dashboard: venituri, taxe, comisioane, facturi
router.get('/report', async (req, res) => {
  // TODO: auth check
  const jobs = await Order.find({ status: { $in: ['paid', 'completed'] } });
  const totalIncome = jobs.reduce((sum, j) => sum + (j.amount || 0), 0);
  const commission = jobs.reduce((sum, j) => sum + (j.amount ? j.amount * 0.1 : 0), 0);
  const net = totalIncome - commission;
  res.json({ totalIncome, commission, net, jobs });
});

module.exports = router;
