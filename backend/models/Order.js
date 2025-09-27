const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  title: String,
  description: String,
  amount: Number,
  status: { type: String, enum: ['pending', 'accepted', 'in_progress', 'completed', 'approved', 'paid'], default: 'pending' },
  beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentIntentId: String,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
});

module.exports = mongoose.model('Order', OrderSchema);
