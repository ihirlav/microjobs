// AI Matching & Pricing Agent
// Runs every minute to match jobs and optimize pricing
const { Job, User } = require('../models');

async function runMatchingAgent() {
  // 1. Get new jobs from last 60 seconds
  const since = new Date(Date.now() - 60 * 1000);
  const jobs = await Job.find({ createdAt: { $gte: since }, status: 'open' });
  for (const job of jobs) {
    // 2. Find available providers in area with rating >=4.5
    const providers = await User.find({
      location: job.location,
      role: 'provider',
      rating: { $gte: 4.5 },
      isAvailable: true
    }).sort({ rating: -1, price: 1 });
    // 3. Notify top 5 providers (stub)
    const topProviders = providers.slice(0, 5);
    // TODO: sendNotification(topProviders, job)
    // 4. Adjust price if needed (stub)
    // TODO: adjustJobPrice(job)
    // 5. Activate local promo if demand low (stub)
    // TODO: activatePromoIfNeeded(job.location)
  }
}

module.exports = { runMatchingAgent };
