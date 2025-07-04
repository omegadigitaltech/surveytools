const Queue = require('bull');
const nodemailer = require('nodemailer');
const User = require('../model/user');

// Set up Redis connection with fallback to local Redis
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Redis connection options with retry strategy
const redisOptions = {
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || '127.0.0.1',
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
      // Exponential backoff with a cap at 30 seconds
      const delay = Math.min(Math.pow(2, times) * 1000, 30000);
      console.log(`Redis connection retry in ${delay}ms`);
      return delay;
    }
  }
};

// Create email notification queue with retry options
let emailQueue;
try {
  emailQueue = new Queue('email-notifications', REDIS_URL, {
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: true
    },
    settings: {
      lockDuration: 30000, // 30 seconds
      stalledInterval: 30000, // 30 seconds
    }
  });

  console.log('Email queue initialized successfully');
  
  // Log errors from the queue
  emailQueue.on('error', (error) => {
    console.error('Queue error:', error);
  });
} catch (error) {
  console.error('Failed to initialize email queue:', error);
}

// Configure email transporter
const getEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth:{
      user: process.env.EMAIL_USER || "tech.digitalomega",
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Process email sending jobs
if (emailQueue) {
  emailQueue.process(async (job) => {
    const { emailType, data } = job.data;
    
    try {
      switch (emailType) {
        case 'survey-published':
          await sendSurveyPublishedNotification(data);
          break;
        case 'password-reset':
          await sendDirectEmail(data);
          break;
        case 'password-reset-confirmation':
          await sendDirectEmail(data);
          break;
        case 'direct-email':
          await sendDirectEmail(data);
          break;
        // Add other email types as needed
        default:
          // If no emailType is specified, assume it's direct email data
          if (typeof job.data === 'object' && job.data.to && job.data.subject) {
            await sendDirectEmail(job.data);
          } else {
            throw new Error(`Unknown email type: ${emailType}`);
          }
      }
      return { success: true };
    } catch (error) {
      console.error(`Email job failed: ${error.message}`);
      throw error;
    }
  });
}

// Send notification about a new published survey to all users
async function sendSurveyPublishedNotification(data) {
  const { survey } = data;
  
  // Ensure we have the creator ID in the right format
  const creatorId = survey.user_id._id || survey.user_id;
  const transporter = getEmailTransporter();
  
  // Get all users (excluding the survey creator)
  const users = await User.find({ 
    _id: { $ne: creatorId }
    // Add additional filters if needed (e.g., matching preferred_participants)
  }).select('email fullname');
  
  console.log(`Found ${users.length} users to notify`);
  
  if (!users.length) {
    console.log('No users to notify about the survey');
    return;
  }
  
  // Ensure creator information is available for the email
  const creatorName = survey.user_id.fullname || 'Survey Creator';
  const creatorInstitution = survey.user_id.instituition || '';
  
  // Create a batch of emails
  const emailPromises = users.map(user => {
    return transporter.sendMail({
      from: `${process.env.EMAIL_USER || "tech.digitalomega@gmail.com"}`,
      to: user.email,
      subject: `New Survey Available: ${survey.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${user.fullname},</h2>
          <p>A new survey has been published that might interest you:</p>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #3b7ddd; margin-top: 0;">${survey.title}</h3>
            <p>${survey.description}</p>
            <p><strong>Creator:</strong> ${creatorName} 
              ${creatorInstitution ? `from ${creatorInstitution}` : ''}</p>
            <p><strong>Points reward:</strong> ${survey.point_per_user || 0} points</p>
          </div>
          <p>Participate now to earn points:</p>
          <a href="${process.env.FRONTEND_URL}/expandsurvey/${survey._id}" 
             style="display: inline-block; background-color: #3b7ddd; color: white; padding: 10px 20px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Take Survey
          </a>
          <p style="margin-top: 30px; font-size: 12px; color: #6c757d;">
            You are receiving this email because you are registered on SurveyPro. 
          </p>
        </div>
      `
    });
  });
  
  // Send emails in batches to avoid overwhelming the email server
  const batchSize = 20;
  for (let i = 0; i < emailPromises.length; i += batchSize) {
    const batch = emailPromises.slice(i, i + batchSize);
    await Promise.all(batch);
    
    // Small delay between batches
    if (i + batchSize < emailPromises.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`Notification emails sent to ${users.length} users for survey: ${survey.title}`);
}

// Send direct email (for password reset, confirmations, etc.)
async function sendDirectEmail(emailData) {
  const transporter = getEmailTransporter();
  
  try {
    const result = await transporter.sendMail({
      from: `${process.env.EMAIL_USER || "tech.digitalomega@gmail.com"}`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || '' // Optional plain text version
    });
    
    console.log(`Direct email sent successfully to ${emailData.to}`);
    return result;
  } catch (error) {
    console.error(`Failed to send email to ${emailData.to}:`, error);
    throw error;
  }
}

// Add job to queue
const addEmailToQueue = (emailTypeOrData, data, options = {}) => {
  if (!emailQueue) {
    console.error('Email queue not initialized, cannot add job');
    return Promise.resolve({ status: 'error', message: 'Queue not available' });
  }
  
  let jobData;
  
  // Check if first parameter is an email data object (new pattern)
  if (typeof emailTypeOrData === 'object' && emailTypeOrData.to && emailTypeOrData.subject) {
    // Direct email data pattern - used by password reset
    jobData = { 
      emailType: 'direct-email', 
      data: emailTypeOrData 
    };
  } else if (typeof emailTypeOrData === 'string' && data) {
    // Traditional pattern - emailType and data
    jobData = { 
      emailType: emailTypeOrData, 
      data: data 
    };
  } else {
    console.error('Invalid parameters for addEmailToQueue');
    return Promise.resolve({ status: 'error', message: 'Invalid parameters' });
  }
  
  return emailQueue.add(
    jobData,
    { 
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: true,
      ...options
    }
  );
};

// Handle completed jobs
if (emailQueue) {
  emailQueue.on('completed', (job) => {
    console.log(`Email job ${job.id} completed`);
  });

  // Handle failed jobs
  emailQueue.on('failed', (job, err) => {
    console.error(`Email job ${job.id} failed with error: ${err.message}`);
  });
}

module.exports = {
  addEmailToQueue
}; 