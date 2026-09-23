const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Find a researcher profile that is Institutional
  const ResearcherProfile = require('./src/kyc/researcher-profile.model');
  const profile = await ResearcherProfile.findOne({ tier: 'Institutional' });
  if (!profile) {
    console.log("No institutional profile found");
    process.exit(1);
  }
  
  // Find user
  const User = require('./model/user');
  const user = await User.findOne({ id: profile.userId });
  if (!user) {
    console.log("User not found for profile");
    process.exit(1);
  }
  
  // Find survey owned by user
  const { Survey } = require('./model/survey');
  const survey = await Survey.findOne({ user_id: user._id });
  if (!survey) {
    console.log("No survey found for this user");
    process.exit(1);
  }
  
  console.log(`Testing with user ${user.id} and survey ${survey._id}`);
  
  // Generate token (check how authMiddleware works. It usually uses process.env.JWT_SECRET)
  // Let's assume standard jwt sign: jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' })
  // Wait, let's look at controllers/auth.js or similar to see what's in the payload. 
  // authMiddleware uses req.userId = decoded.id;
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  
  const formats = ['csv', 'pdf', 'xlsx', 'json', 'pptx', 'spss'];
  for (const fmt of formats) {
    try {
      console.log(`\nTesting format: ${fmt}`);
      const res = await axios.get(`http://localhost:5003/v1/dashboard/corporate/export?surveyId=${survey._id}&format=${fmt}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'arraybuffer'
      });
      
      const fileName = `/tmp/export_test.${fmt}`;
      fs.writeFileSync(fileName, res.data);
      console.log(`Success: downloaded ${res.data.length} bytes to ${fileName}`);
      console.log(`Headers: content-type=${res.headers['content-type']}, content-disposition=${res.headers['content-disposition']}`);
    } catch (err) {
      if (err.response) {
        console.log(`Failed with status ${err.response.status}`);
        const msg = JSON.parse(err.response.data.toString());
        console.log(`Error message: ${JSON.stringify(msg)}`);
      } else {
        console.log(`Error: ${err.message}`);
      }
    }
  }
  
  process.exit(0);
}

run().catch(console.error);
