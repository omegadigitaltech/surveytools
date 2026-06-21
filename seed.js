require('dotenv').config();
const mongoose = require('mongoose');
const { Survey } = require('./model/survey');
const User = require('./model/user');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/surveypro';

// Helper for normally distributed random numbers
function randomNormal(min, max, skew = 1) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return randomNormal(min, max, skew); // resample
  num = Math.pow(num, skew); // Skew
  num *= max - min; // Stretch to fill range
  num += min; // offset to min
  return Math.round(num);
}

// Generate constrained 1-5 scale based on a mean
function generateRating(meanTarget) {
  // Add some random noise
  let val = Math.round(randomNormal(meanTarget - 1.5, meanTarget + 1.5));
  if (val < 1) val = 1;
  if (val > 5) val = 5;
  return val.toString();
}

async function seedData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');
    
    // Clear old data to prevent bloating
    await User.deleteMany({});
    await Survey.deleteMany({});
    console.log('Cleared existing users and surveys.');

    const faculties = ['Science', 'Engineering', 'Arts', 'Business', 'Medicine'];
    const departments = {
      'Science': ['Biology', 'Chemistry', 'Physics', 'Computer Science'],
      'Engineering': ['Civil', 'Mechanical', 'Electrical', 'Software'],
      'Arts': ['History', 'Philosophy', 'Literature', 'Sociology'],
      'Business': ['Finance', 'Marketing', 'Accounting', 'Management'],
      'Medicine': ['Nursing', 'Pre-Med', 'Pharmacy', 'Anatomy']
    };

    // Create 100 Users
    const users = [];
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    for (let i = 1; i <= 100; i++) {
      const fac = faculties[Math.floor(Math.random() * faculties.length)];
      const deptList = departments[fac];
      const dept = deptList[Math.floor(Math.random() * deptList.length)];
      const gen = Math.random() > 0.5 ? 'Male' : 'Female';
      
      const user = new User({
        fullname: `Test User ${i}`,
        email: `testuser${i}@example.com`,
        gender: gen,
        department: dept,
        faculty: fac,
        instituition: 'Test University',
        password: hashedPassword,
      });
      await user.save();
      users.push(user);
    }
    console.log('Created 100 diverse users');

    // Questions Schema Setup
    const questionsParams = [
      { id: 0, text: 'What is your primary faculty?', type: 'multiple_choice', options: faculties.map(f => ({ text: f })) },
      { id: 1, text: 'What is your gender?', type: 'multiple_choice', options: [{ text: 'Male' }, { text: 'Female' }, { text: 'Non-binary' }] },
      { id: 2, text: 'How satisfied are you with your courses?', type: 'five_point', options: [] },
      { id: 3, text: 'How would you rate the campus facilities?', type: 'five_point', options: [] },
      { id: 4, text: 'How would you rate the library resources?', type: 'five_point', options: [] },
      { id: 5, text: 'How would you rate the IT infrastructure?', type: 'five_point', options: [] },
      { id: 6, text: 'On average, how many hours do you study per week?', type: 'fill_in', options: [] }, // continuous
      { id: 7, text: 'How many minutes do you commute each day?', type: 'fill_in', options: [] }, // continuous
      { id: 8, text: 'How satisfied are you with campus food?', type: 'five_point', options: [] },
      { id: 9, text: 'How satisfied are you with the dorms?', type: 'five_point', options: [] },
      { id: 10, text: 'Rate your current stress levels (1-Low, 5-High).', type: 'five_point', options: [] },
      { id: 11, text: 'How likely are you to recommend this university?', type: 'five_point', options: [] },
      { id: 12, text: 'What are your primary modes of transportation?', type: 'multiple_selection', options: [{text: 'Walking'}, {text: 'Bus'}, {text: 'Car'}, {text: 'Bicycle'}] },
      { id: 13, text: 'Which extracurriculars are you involved in?', type: 'multiple_selection', options: [{text: 'Sports'}, {text: 'Debate'}, {text: 'Tech Club'}, {text: 'Arts Club'}] },
      { id: 14, text: 'Rate the mental health support services.', type: 'five_point', options: [] },
      { id: 15, text: 'How many internships have you completed?', type: 'fill_in', options: [] }, // continuous
      { id: 16, text: 'What is your expected starting salary (in thousands)?', type: 'fill_in', options: [] }, // continuous
      { id: 17, text: 'Are you an international student?', type: 'multiple_choice', options: [{text: 'Yes'}, {text: 'No'}] },
      { id: 18, text: 'Rate the career services.', type: 'five_point', options: [] },
      { id: 19, text: 'Any additional comments?', type: 'fill_in', options: [] },
    ];

    const survey = new Survey({
      user_id: users[0]._id, // Owner
      title: 'Comprehensive Campus Experience & Demographics Survey 2026',
      description: 'A massive 20-question survey evaluating all aspects of university life. Powered by Antigravity.',
      gender: 'All',
      preferred_participants: faculties,
      published: true,
      no_of_participants: 100,
      faculty_participants: { "Science": 20, "Engineering": 20, "Arts": 20, "Business": 20, "Medicine": 20 },
      submittedUsers: users.map(u => u._id),
      questions: questionsParams.map(q => ({
        questionText: q.text,
        questionType: q.type,
        options: q.options,
        answers: [],
        analytics: { distribution: new Map(), totalResponses: 0 }
      }))
    });

    // Populate answers with LOGICAL CORRELATIONS
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      
      // Determine base stats for the user to drive correlations
      const fac = u.faculty;
      const isSTEM = (fac === 'Science' || fac === 'Engineering' || fac === 'Medicine');
      const isBusiness = (fac === 'Business');
      
      const studyHours = isSTEM ? randomNormal(20, 60) : randomNormal(10, 40);
      const commuteMins = randomNormal(0, 120);
      const stressLevel = Math.min(5, Math.max(1, Math.round((studyHours / 60) * 5 + randomNormal(-1, 1))));
      
      const internships = isBusiness ? randomNormal(1, 4) : (isSTEM ? randomNormal(0, 3) : randomNormal(0, 2));
      let expectedSalary = 50 + (internships * 10);
      if (isSTEM) expectedSalary += 20;
      if (isBusiness) expectedSalary += 30;
      expectedSalary += randomNormal(-10, 20); // noise

      // Now generate the 20 answers
      const answers = [];
      
      answers[0] = fac; // Q1: Faculty matches profile
      answers[1] = u.gender; // Q2: Gender matches profile
      
      // Course satisfaction (Arts might be slightly happier than stressed STEM)
      answers[2] = isSTEM ? generateRating(3.5) : generateRating(4.2);
      
      // Campus Facilities (negatively correlated with commute - if you commute, you hate campus)
      const facilityRatingTarget = commuteMins > 60 ? 2.0 : 4.5;
      answers[3] = generateRating(facilityRatingTarget);
      
      answers[4] = generateRating(4.0); // Library
      answers[5] = generateRating(3.0); // IT
      
      answers[6] = studyHours.toString(); // Q7
      answers[7] = commuteMins.toString(); // Q8
      
      answers[8] = generateRating(2.5); // Food sucks generally
      answers[9] = generateRating(3.5); // Dorms ok
      
      answers[10] = stressLevel.toString(); // Q11 Stress
      
      // Recommend is correlated with Course Satisfaction
      const courseSatInt = parseInt(answers[2]);
      answers[11] = generateRating(courseSatInt); // strongly correlated
      
      // Multi-select logic
      const transport = commuteMins > 30 ? ['Car', 'Bus'] : ['Walking', 'Bicycle'];
      answers[12] = [transport[Math.floor(Math.random() * transport.length)]]; 
      
      const clubs = isSTEM ? ['Tech Club'] : (isBusiness ? ['Debate'] : ['Arts Club']);
      if (Math.random() > 0.5) clubs.push('Sports');
      answers[13] = clubs;

      // Mental health rating (negatively correlated with stress)
      answers[14] = generateRating(6 - stressLevel);
      
      answers[15] = internships.toString();
      answers[16] = expectedSalary.toString();
      
      answers[17] = Math.random() > 0.8 ? 'Yes' : 'No'; // International
      
      answers[18] = isBusiness ? generateRating(4.5) : generateRating(3.0); // Career services
      
      const comments = ["Great school!", "Needs better food.", "Too much homework.", "Loved my professors.", "Parking is a nightmare."];
      answers[19] = comments[Math.floor(Math.random() * comments.length)];

      // Push answers into the survey schema and update distribution maps
      for (let qIdx = 0; qIdx < 20; qIdx++) {
        const responseVal = answers[qIdx];
        
        survey.questions[qIdx].answers.push({
          userId: u._id,
          fullname: u.fullname,
          response: responseVal
        });
        
        survey.questions[qIdx].analytics.totalResponses++;

        // Update distribution map (handle arrays for multi-select)
        const updateDist = (val) => {
          let strVal = String(val).replace(/\./g, ''); // Mongoose Maps forbid '.' in keys
          const currentCount = survey.questions[qIdx].analytics.distribution.get(strVal) || 0;
          survey.questions[qIdx].analytics.distribution.set(strVal, currentCount + 1);
        };

        if (Array.isArray(responseVal)) {
          responseVal.forEach(v => updateDist(v));
        } else {
          updateDist(responseVal);
        }
      }
    }
    
    await survey.save();
    console.log('Created Survey with ID:', survey._id);
    console.log('Statistical correlations successfully embedded into mock data.');
    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedData();
