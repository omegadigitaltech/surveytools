const mongoose = require('mongoose');
const Sentiment = require('sentiment');
const Survey = require('./path/to/surveyModel');

const sentiment = new Sentiment();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/surveyDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Function to calculate sentiment analysis
const calculateSentiment = (responses) => {
  const sentimentScores = responses.map(response => sentiment.analyze(response.response).score);
  const positive = sentimentScores.filter(score => score > 0).length;
  const neutral = sentimentScores.filter(score => score === 0).length;
  const negative = sentimentScores.filter(score => score < 0).length;

  return { positive, neutral, negative };
};

// Example function to create a survey with sentiment analysis
const createSurveyWithSentiment = async () => {
  const fillInResponses = [
    { userId: '1234', username: 'nyii', response: 'I love the product' },
    { userId: '1234', username: 'nyii', response: 'It makes sense' }
  ];

  const sentimentAnalysis = calculateSentiment(fillInResponses);

  const newSurvey = new Survey({
    title: 'Customer Satisfaction Survey',
    description: 'A survey to measure customer satisfaction.',
    questions: [
      {
        questionId: 'q1',
        questionText: 'How satisfied are you with our service?',
        questionType: 'five_point',
        answers: [
          { userId: '1234', username: 'nyii', response: 5 },
          { userId: '1234', username: 'nyii', response: 4 }
        ],
        analytics: {
          totalResponses: 10,
          distribution: { '5': 10, '4': 2, '3': 10, '2': 2, '1': 10 },
          averageRating: 3.4,
          responseRate: '50%',
          mostCommonResponse: 5
        }
      },
      {
        questionId: 'q2',
        questionText: 'What can we improve?',
        questionType: 'fill_in',
        answers: fillInResponses,
        analytics: {
          totalResponses: 15,
          responseRate: '75%',
          sentimentAnalysis: sentimentAnalysis
        }
      },
      {
        questionId: 'q3',
        questionText: 'Which of our products do you use?',
        questionType: 'multiple_choice',
        options: [
          { id: '1', text: 'Product A' },
          { id: '2', text: 'Product B' },
          { id: '3', text: 'Product C' }
        ],
        answers: [
          { userId: '1234', username: 'nyii', response: '1' },
          { userId: '1234', username: 'nyii', response: '1' }
        ],
        analytics: {
          totalResponses: 20,
          distribution: { '1': 10, '2': 2, '3': 10 },
          responseRate: '100%',
          mostCommonResponse: '1'
        }
      }
    ]
  });

  await newSurvey.save();
  console.log('Survey created successfully with sentiment analysis');
};

createSurveyWithSentiment();
