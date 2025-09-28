const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticate } = require('../middleware/auth');

// Fiscal dashboard: venituri, taxe, comisioane, facturi
router.get('/report', authenticate, async (req, res) => {
  try {
    // Preluăm doar comenzile finalizate și plătite pentru prestatorul autentificat
    const jobs = await Order.find({ 
      provider: req.user.id,
      status: { $in: ['approved', 'paid'] } 
    });

    const totalIncome = jobs.reduce((sum, j) => sum + (j.amount || 0), 0);
    const commission = totalIncome * 0.1; // Presupunem un comision de 10%
    const net = totalIncome - commission;

    // Agregare date pentru grafic (venituri pe lună)
    const monthlyIncome = jobs.reduce((acc, job) => {
      const month = new Date(job.completedAt || job.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += job.amount;
      return acc;
    }, {});

    const chartData = {
      labels: Object.keys(monthlyIncome),
      data: Object.values(monthlyIncome),
    };

    res.json({ totalIncome, commission, net, jobs, chartData });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la generarea raportului fiscal.' });
  }
});

module.exports = router;
