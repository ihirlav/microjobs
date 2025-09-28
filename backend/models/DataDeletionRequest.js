const mongoose = require('mongoose');

const DataDeletionRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  email: { type: String, required: true },
  requestDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' }
});

module.exports = mongoose.model('DataDeletionRequest', DataDeletionRequestSchema);
