const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./model/user');

const email = process.argv[2];

if (!email) {
  console.error("Usage: node make_admin.js <email>");
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI || process.env.DB_URL || process.env.DATABASE_URL)
  .then(async () => {
    const user = await User.findOneAndUpdate(
      { email },
      { admin: true },
      { new: true }
    );
    
    if (user) {
      console.log(`Success: User ${email} is now an admin.`);
    } else {
      console.log(`Error: User ${email} not found.`);
    }
    
    mongoose.disconnect();
    process.exit(0);
  })
  .catch(e => {
    console.error("Database connection error:", e.message);
    process.exit(1);
  });
