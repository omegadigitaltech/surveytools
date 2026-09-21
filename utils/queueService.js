const Queue = require('bull');
const nodemailer = require('nodemailer');
const User = require('../model/user');

// Set up Redis connection with fallback to local Redis
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';



let emailQueue = null;
let redisConnected = false;
let redisWarningLogged = false;

// Pre-check Redis availability before handing off to Bull.
// Bull's ioredis client throws unhandled promise rejections when Redis is
// offline and retryStrategy returns null, so we probe first and only create
// the queue when Redis is actually reachable.
const net = require('net');

function probeRedis(url) {
  return new Promise((resolve) => {
    let host = '127.0.0.1';
    let port = 6379;
    try {
      const parsed = new URL(url);
      host = parsed.hostname || host;
      port = parseInt(parsed.port, 10) || port;
    } catch (_) {}

    const socket = net.createConnection({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 1000);

    socket.on('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(true);
    });

    socket.on('error', () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
}

// Initialize queue asynchronously — if Redis is offline we skip Bull entirely
(async () => {
  const redisAvailable = await probeRedis(REDIS_URL);

  if (!redisAvailable) {
    console.warn(`⚠️ Redis is unavailable at ${REDIS_URL}. Background email queue is disabled; critical emails will be sent directly.`);
    return;
  }

  try {
    emailQueue = new Queue('email-notifications', REDIS_URL, {
      redis: {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
      defaultJobOptions: {
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
      },
      settings: {
        lockDuration: 30000,
        stalledInterval: 30000,
      },
    });

    emailQueue.on('ready', () => {
      redisConnected = true;
      console.log('✅ Email queue connected to Redis successfully');
    });

    emailQueue.on('error', (error) => {
      redisConnected = false;
      if (!redisWarningLogged) {
        console.warn(`⚠️ Email queue error: ${error.message}`);
        redisWarningLogged = true;
      }
    });

    // Process email sending jobs
    emailQueue.process(async (job) => {
      const { emailType, data } = job.data;

      try {
        switch (emailType) {
          case 'survey-published':
            await sendSurveyPublishedNotification(data);
            break;
          case 'password-reset':
          case 'password-reset-confirmation':
          case 'direct-email':
            await sendDirectEmail(data);
            break;
          default:
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

    emailQueue.on('completed', (job) => {
      console.log(`Email job ${job.id} completed`);
    });

    emailQueue.on('failed', (job, err) => {
      console.error(`Email job ${job.id} failed with error: ${err.message}`);
    });

    console.log('✅ Email queue initialized successfully');
  } catch (error) {
    console.warn('⚠️ Failed to initialize email queue:', error.message);
    emailQueue = null;
  }
})();


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
const addEmailToQueue = async (emailTypeOrData, data, options = {}) => {
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

  // If Redis is offline or queue is not available, fallback directly for direct transactional emails
  if (!emailQueue || !redisConnected) {
    if (jobData.emailType === 'direct-email' || jobData.emailType === 'password-reset' || jobData.emailType === 'password-reset-confirmation') {
      try {
        console.log(`Redis queue is offline; sending direct email to ${jobData.data.to || jobData.data.email}`);
        await sendDirectEmail(jobData.data);
        return { status: 'success', message: 'Email sent directly' };
      } catch (err) {
        console.error('Direct email fallback failed:', err);
        return { status: 'error', message: err.message };
      }
    } else {
      console.warn(`Redis queue is offline; skipped background batch notification for ${jobData.emailType}`);
      return { status: 'skipped', message: 'Queue unavailable' };
    }
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

module.exports = {
  addEmailToQueue
};