/**
 * DEV-ONLY seed script — creates a test User, Institutional ResearcherProfile,
 * Survey (with questions/answers), and DemographicAggregate records, then fires
 * live requests against all 6 corporate-dashboard export formats.
 *
 * WARNING: connects to whatever MONGODB_URI is set in .env and writes real
 * documents to that database. Do NOT run against staging/production.
 * Intended for local dev-server E2E verification only.
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const User = require('../model/user');
  const ResearcherProfile = require('../src/kyc/researcher-profile.model');
  const { Survey } = require('../model/survey');
  const DemographicAggregate = require('../model/demographic-aggregate');
  
  // 1. Seed User
  const testUserId = 'auth0|test_export_real_e2e';
  let user = await User.findOne({ id: testUserId });
  if (!user) {
    user = await User.create({
      fullname: 'Test Exporter',
      email: 'test_export_e2e@test.com',
      phone: '0987654321',
      password: 'password123',
      id: testUserId,
      instituition: 'Test Inst',
      faculty: 'Test Faculty',
      department: 'Test Dept',
      gender: 'Male',
      country: 'Test Country',
      state: 'Test State'
    });
  }
  
  // 2. Seed Profile
  await ResearcherProfile.updateOne(
    { userId: user.id },
    { $set: { researcherType: 'corporate', tier: 'Institutional' } },
    { upsert: true }
  );
  
  // 3. Seed Survey
  let survey = await Survey.findOne({ user_id: user._id, title: 'Export Test Survey Real E2E' });
  if (!survey) {
    survey = await Survey.create({
      user_id: user._id,
      title: 'Export Test Survey Real E2E',
      description: 'Testing exports',
      gender: 'All',
      preferred_participants: ['All'],
      no_of_participants: 2,
      questions: [
        {
          questionText: 'Test Question 1',
          questionType: 'fill_in',
          answers: [
            { userId: user._id, fullname: 'John Doe', response: 'Answer 1' },
            { userId: user._id, fullname: 'Jane Doe', response: 'Answer 2' }
          ]
        },
        {
          questionText: 'Test Question 2',
          questionType: 'multiple_choice',
          options: [{ text: 'Yes' }, { text: 'No' }],
          answers: [
            { userId: user._id, fullname: 'John Doe', response: 'Yes' },
            { userId: user._id, fullname: 'Jane Doe', response: 'No' }
          ]
        }
      ]
    });
  }
  
  // 4. Seed Demographic Aggregates
  await DemographicAggregate.deleteMany({ surveyId: survey._id });
  await DemographicAggregate.create({
    surveyId: survey._id,
    layer: 'layer3',
    field: 'gender',
    value: 'Male',
    count: 1
  });
  await DemographicAggregate.create({
    surveyId: survey._id,
    layer: 'layer3',
    field: 'gender',
    value: 'Female',
    count: 1
  });
  await DemographicAggregate.create({
    surveyId: survey._id,
    layer: 'layer3',
    field: 'stateOfResidence',
    value: 'Lagos',
    count: 2
  });
  
  console.log(`\n✅ SEEDED TEST DATA SUCCESSFULLY`);
  console.log(`User.id: ${user.id}`);
  console.log(`Survey._id: ${survey._id}`);
  
  // 5. Mint JWT (Note: authMiddleware expects { userId: user.id })
  const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  
  // 6. Test all formats
  const formats = ['csv', 'pdf', 'xlsx', 'json', 'pptx', 'spss'];
  for (const fmt of formats) {
    try {
      console.log(`\n---------------------------------`);
      console.log(`Testing format: ${fmt}`);
      const res = await axios.get(`http://localhost:5003/v1/dashboard/corporate/export?surveyId=${survey._id}&format=${fmt}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'arraybuffer' // so we can save bytes
      });
      
      const fileName = `export_test.${fmt}`;
      fs.writeFileSync(fileName, res.data);
      
      console.log(`Status Code: ${res.status}`);
      console.log(`Content-Type: ${res.headers['content-type']}`);
      console.log(`Content-Disposition: ${res.headers['content-disposition']}`);
      console.log(`Body Saved As: ${fileName} (${res.data.length} bytes)`);
      
    } catch (err) {
      if (err.response) {
        console.log(`Status Code: ${err.response.status}`);
        const msg = err.response.data.toString();
        console.log(`Error body: ${msg}`);
      } else {
        console.log(`Error: ${err.message}`);
      }
    }
  }
  
  // Clean up
  // await Survey.deleteOne({ _id: survey._id });
  // await DemographicAggregate.deleteMany({ surveyId: survey._id });
  // await ResearcherProfile.deleteOne({ userId: user.id });
  // await User.deleteOne({ _id: user._id });
  
  process.exit(0);
}

run().catch(console.error);
