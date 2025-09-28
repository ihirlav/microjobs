const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  photo: { type: String },
  location: { type: String },
  age: { type: Number },
  role: { type: String, enum: ['beneficiary', 'provider'], default: 'beneficiary' },
  createdAt: { type: Date, default: Date.now },
  // Câmpuri adăugate pentru profil detaliat
  cvUrl: { type: String }, // Link către CV (PDF, etc.)
  portfolio: [{
    title: String,
    description: String,
    imageUrl: String,
    projectUrl: String
  }],
  badges: [{ type: String }], // Ex: ['Verified ID', 'Top Rated']
  kycStatus: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' },
  skills: [{ type: String }],
  onboardingCompleted: { type: Boolean, default: false },
  // Câmpuri pentru gamificare
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  // ID-ul contului Stripe Connect pentru prestatori
  stripeAccountId: { type: String }
});

module.exports = mongoose.model('User', UserSchema);
