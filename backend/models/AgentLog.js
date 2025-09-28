const mongoose = require('mongoose');

const AgentLogSchema = new mongoose.Schema({
  agent: { type: String, required: true, index: true }, // e.g., 'payments', 'legal', 'matching'
  message: { type: String, required: true },
  level: { type: String, default: 'info' }, // 'info', 'warn', 'error'
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AgentLog', AgentLogSchema);