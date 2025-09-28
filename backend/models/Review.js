const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { // Ratingul general, calculat ca medie
    type: Number,
    min: 1,
    max: 5
  },
  criteria: { // Ratinguri detaliate
    quality: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 }
  },
  comment: String,
  createdAt: { type: Date, default: Date.now },
  disputeStatus: { type: String, enum: ['none', 'open', 'resolved'], default: 'none' }
});

module.exports = mongoose.model('Review', ReviewSchema);
