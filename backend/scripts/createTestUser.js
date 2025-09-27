require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createTestUser() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const email = 'testuser@example.com';
  const password = await bcrypt.hash('test1234', 10);
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({
      firstName: 'Test',
      lastName: 'User',
      email,
      password,
      role: 'beneficiary',
      location: 'Cluj-Napoca',
      age: 30
    });
    await user.save();
    console.log('Test user created:', email);
  } else {
    console.log('Test user already exists:', email);
  }
  mongoose.disconnect();
}

createTestUser();
