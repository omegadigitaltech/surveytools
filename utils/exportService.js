const createCsvString = (data) => {
  if (!data || !data.length) return '';
  
  // Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return headers.map(header => {
      // Handle values that might contain commas or quotes
      let value = item[header];
      
      // Convert arrays and objects to JSON strings
      if (value !== null && typeof value === 'object') {
        value = JSON.stringify(value);
      }
      
      // Convert to string and escape quotes
      value = String(value || '').replace(/"/g, '""');
      
      // Wrap in quotes if contains commas, quotes, or newlines
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        value = `"${value}"`;
      }
      
      return value;
    }).join(',');
  });
  
  // Combine header and data rows
  return [headerRow, ...rows].join('\n');
};

const formatSurveyDataForGoogleStyleCsv = (survey, userMap = new Map()) => {
  // Map respondents by their ID for easy lookup
  const respondentsMap = new Map();
  const respondentIds = [];
  
  // Format date to match Google Forms format
  const formatTimestamp = (date) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Get timezone offset in GMT format
    const tzOffset = now.getTimezoneOffset();
    const tzSign = tzOffset <= 0 ? '+' : '-';
    const tzHours = String(Math.abs(Math.floor(tzOffset / 60))).padStart(2, '0');
    
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds} GMT${tzSign}${tzHours}`;
  };
  
  // Gather all unique respondents
  survey.questions.forEach(question => {
    question.answers.forEach(answer => {
      const respondentId = answer.userId.toString();
      if (!respondentsMap.has(respondentId)) {
        // Get user email from userMap if available
        const userEmail = userMap.get(respondentId)?.email || '';
        
        respondentsMap.set(respondentId, {
          userId: respondentId,
          fullname: answer.fullname,
          email: userEmail,
          responses: {},
          timestamp: formatTimestamp(new Date()) // Format timestamp to match Google Forms
        });
        respondentIds.push(respondentId);
      }
      
      // Store the response for this question
      respondentsMap.get(respondentId).responses[question._id.toString()] = answer.response;
    });
  });
  
  // Create the Google-style CSV structure
  const headers = ['Timestamp', 'Username', 'Email:'];
  const questions = [];
  
  // Add all questions to the headers
  survey.questions.forEach(question => {
    headers.push(question.questionText);
    questions.push({
      id: question._id.toString(),
      text: question.questionText,
      type: question.questionType
    });
  });
  
  // Create the rows
  const rows = respondentIds.map(id => {
    const respondent = respondentsMap.get(id);
    const row = {
      'Timestamp': respondent.timestamp,
      'Username': respondent.fullname,
      'Email:': respondent.email
    };
    
    // Add responses for each question
    questions.forEach(question => {
      row[question.text] = respondent.responses[question.id] || '';
    });
    
    return row;
  });
  
  return rows;
};

const formatSurveyDataForCsv = (survey, userMap = new Map()) => {
  // Basic survey information
  const surveyInfo = {
    title: survey.title,
    description: survey.description,
    createdAt: survey.createdAt,
    totalParticipants: survey.submittedUsers.length,
    maxParticipants: survey.no_of_participants,
    gender: survey.gender,
    preferred_participants: survey.preferred_participants.join(', ')
  };
  
  // Process questions and responses
  const questionResponses = [];
  
  survey.questions.forEach(question => {
    // For each question, prepare its analytics
    const analytics = {
      questionId: question._id.toString(),
      questionText: question.questionText,
      questionType: question.questionType,
      totalResponses: question.answers.length
    };
    
    // Add type-specific analytics
    if (question.questionType === 'multiple_choice') {
      // Create a distribution map for each option
      const distribution = {};
      question.options.forEach(option => {
        distribution[option.text] = 0;
      });
      
      // Count responses for each option
      question.answers.forEach(answer => {
        if (distribution[answer.response] !== undefined) {
          distribution[answer.response]++;
        }
      });
      
      analytics.distribution = distribution;
      
      // Find most common response
      let maxCount = 0;
      let mostCommon = null;
      Object.entries(distribution).forEach(([option, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommon = option;
        }
      });
      analytics.mostCommonResponse = mostCommon;
      
    } else if (question.questionType === 'five_point') {
      // Calculate average rating
      let sum = 0;
      question.answers.forEach(answer => {
        sum += parseInt(answer.response, 10);
      });
      analytics.averageRating = question.answers.length ? (sum / question.answers.length).toFixed(2) : 0;
      
      // Distribution of ratings
      const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
      question.answers.forEach(answer => {
        distribution[answer.response]++;
      });
      analytics.distribution = distribution;
      
    } else if (question.questionType === 'fill_in') {
      // For fill_in questions, we just list all the responses
      analytics.responses = question.answers.map(answer => ({
        respondent: answer.fullname,
        response: answer.response
      }));
    }
    
    questionResponses.push(analytics);
  });
  
  // For individual responses (one row per respondent per question)
  const individualResponses = [];
  
  if (survey.submittedUsers.length > 0) {
    survey.questions.forEach(question => {
      question.answers.forEach(answer => {
        // Get user email from userMap if available
        const userEmail = userMap.get(answer.userId.toString())?.email || '';
        
        individualResponses.push({
          questionId: question._id.toString(),
          questionText: question.questionText,
          questionType: question.questionType,
          respondentId: answer.userId.toString(),
          respondentName: answer.fullname,
          respondentEmail: userEmail,
          response: answer.response
        });
      });
    });
  }
  
  return {
    surveyInfo,
    questionResponses,
    individualResponses,
    googleStyleData: formatSurveyDataForGoogleStyleCsv(survey, userMap)
  };
};

module.exports = {
  createCsvString,
  formatSurveyDataForCsv
}; 