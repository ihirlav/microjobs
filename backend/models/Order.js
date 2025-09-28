const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  title: String,
  description: String,
  amount: Number,
  tags: [{ type: String }], // Tag-uri pentru căutare avansată (ex: 'react', 'design', 'plumbing')
  status: { type: String, enum: ['pending', 'accepted', 'in_progress', 'completed', 'approved', 'paid'], default: 'pending' },
  beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentIntentId: String,
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
});

// Creăm un index de tip 'text' pentru a permite căutarea full-text și calcularea relevanței
// Căutarea se va face în câmpurile 'title', 'description' și 'tags'
OrderSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Order', OrderSchema);
