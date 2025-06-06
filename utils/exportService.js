const createCsvString = (data) => {
  if (!data || !data.length) return '';
  
  // Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV header row with proper quoting for headers containing commas
  const headerRow = headers.map(header => {
    // Always quote headers to be safe, especially if they contain commas
    return `"${header.replace(/"/g, '""')}"`; 
  }).join(',');
  
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
        respondentsMap.set(respondentId, {
          userId: respondentId,
          responses: {},
          timestamp: formatTimestamp(new Date())
        });
        respondentIds.push(respondentId);
      }
      
      // Store the response for this question, handling multiple_selection specially
      let responseValue = answer.response;
      
      // If this is a multiple_selection question with array response, join with semicolons
      if (question.questionType === 'multiple_selection' && Array.isArray(responseValue)) {
        responseValue = responseValue.join('; ');
      }
      
      // Add additional input if it exists
      if (answer.additionalInput && typeof answer.additionalInput === 'object') {
        const additionalInputEntries = Object.entries(answer.additionalInput);
        if (additionalInputEntries.length > 0) {
          const additionalText = additionalInputEntries
            .map(([option, input]) => `${option}: ${input}`)
            .join('; ');
          
          responseValue = Array.isArray(answer.response) 
            ? `${responseValue} [Additional: ${additionalText}]`
            : `${responseValue} [Additional: ${additionalText}]`;
        }
      }
      
      respondentsMap.get(respondentId).responses[question._id.toString()] = responseValue;
    });
  });
  
  // Create the Google-style CSV structure
  const headers = ['Timestamp'];
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
      'Timestamp': respondent.timestamp
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
        if (answer.response) {
          // The stored keys might have dots replaced with underscores, 
          // but we want to display the original option text
          const originalOptionText = question.options.find(opt => 
            opt.text.replace(/\./g, '_').replace(/\$/g, '_') === answer.response.replace(/\./g, '_').replace(/\$/g, '_')
          )?.text || answer.response;
          
          if (distribution[originalOptionText] !== undefined) {
            distribution[originalOptionText]++;
          }
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
    } else if (question.questionType === 'multiple_selection') {
      // Create a distribution map for each option
      const distribution = {};
      question.options.forEach(option => {
        distribution[option.text] = 0;
      });
      
      // Count selections for each option
      question.answers.forEach(answer => {
        if (Array.isArray(answer.response)) {
          answer.response.forEach(selected => {
            // Find the original option text that matches the sanitized key
            const originalOptionText = question.options.find(opt => 
              opt.text.replace(/\./g, '_').replace(/\$/g, '_') === selected.replace(/\./g, '_').replace(/\$/g, '_')
            )?.text || selected;
            
            if (distribution[originalOptionText] !== undefined) {
              distribution[originalOptionText]++;
            }
          });
        }
      });
      
      analytics.distribution = distribution;
      
      // Find most common selected option
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
        individualResponses.push({
          questionId: question._id.toString(),
          questionText: question.questionText,
          questionType: question.questionType,
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