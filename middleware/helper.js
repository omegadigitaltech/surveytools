const nodemailer = require("nodemailer");
const User = require("../model/user");
const Sentiment = require("sentiment");

const sentiment = new Sentiment();

const domain = "https://surveypro.onrender.com";

async function sendNotification(email, owner, text, title) {
  console.log(email, text);

  // Set up email content
  const htmlContent = `

  <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">

    <h2 style="color: #333;">Hello ${owner},</h2>

    <p>We received a request to verify your account. Please use the One-Time Password (OTP) below to continue:</p>

    <div style="margin: 25px 0; padding: 15px; background: #f7f7f7; border-radius: 8px; text-align: center;">
      <h1 style="font-size: 32px; letter-spacing: 4px; margin: 0;">${text}</h1>
    </div>

    <p>This code is valid for the next <strong>10 minutes</strong>. If you did not request this verification, you can safely ignore this email.</p>

    <p>
      For your security, please do not share this code with anyone.  
      We will never ask you for your OTP via phone, email, or chat.
    </p>

    <br>

    <p>Sincerely,</p>
    <p><strong>Omega Team</strong></p>

  </div>

`;

  // send the reset email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "tech.digitalomega",
      // pass: process.env.EMAIL_PASSWORD
      pass: "aehe qanw pvhm caix",
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: title,
    html: htmlContent,
  };

  const transport = await transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent");
    }
  });

  return { transport: transport };
}

const generateID_users = (length) => {
  const charset = "0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    token += charset[randomIndex];
  }

  return token;
};

// send verification email
const getVerification = async (userid) => {
  // redirect to home if verified
  const user = await User.findOne({ id: userid });
  if (user.verified == true) {
    return { verified: true };
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000);
  console.log("Generated OTP:", otp);

  const user_ = await User.findOneAndUpdate(
    { id: userid },
    { code: otp },
    { new: true }
  );

  // send otp
  await sendNotification(
    user.email,
    user.fullname,
    otp,
    "OTP Verification mail"
  );

  return { verified: false };
};

// Function to calculate sentiment analysis
const calculateSentiment = (responses) => {
  const sentimentScores = responses.map(
    (response) => sentiment.analyze(response.response).score
  );
  const positive = sentimentScores.filter((score) => score > 0).length;
  const neutral = sentimentScores.filter((score) => score === 0).length;
  const negative = sentimentScores.filter((score) => score < 0).length;

  return { positive, neutral, negative };
};

module.exports = {
  sendNotification,
  generateID_users,
  getVerification,
  calculateSentiment,
  url: domain,
};
