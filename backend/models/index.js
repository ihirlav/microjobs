const User = require('./User');
const Order = require('./Order');
const Review = require('./Review');

module.exports = {
  User,
  Job: Order, // pentru compatibilitate cu agentul (Job = Order)
  Review
};
