require("dotenv").config();
require('express-async-errors');

const express = require("express");
const session = require('express-session')
const bodyParser = require("body-parser");
const connectDB = require('./db/connectDB')
const passport = require("passport");
const nodemailer = require('nodemailer')
const otpGenerator = require('otp-generator');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const redis = require('redis');

const User = require('./model/user')


const authRouter = require('./routes/auth')
const mainRouter = require('./routes/main')
const redemptionRouter = require('./routes/redemption')
const adminRouter = require('./routes/admin')
const errorHandlerMiddleware = require('./middleware/error-handler')
const uploadErrorHandler = require('./middleware/errorHandler')
const notFoundMiddleware = require('./middleware/not-found')

const app = express();
require('./middleware/passport');

const allowedOrigins = ['http://localhost:5000', 'http://localhost:5173'];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };
const corsOptions = {
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
};
app.use(cors());

app.use(express.static("public"));
app.use(bodyParser.json());
// app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use(session({
    secret: process.env.sessionSECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 2592000000 }
}))

app.use(passport.initialize())
app.use(passport.session())

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create temp_files directory if it doesn't exist
const tempFilesDir = path.join(__dirname, 'temp_files');
if (!fs.existsSync(tempFilesDir)) {
  fs.mkdirSync(tempFilesDir, { recursive: true });
}

// Check Redis connection
const checkRedisConnection = async () => {
  try {
    const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    console.log(`Attempting to connect to Redis at ${REDIS_URL}`);
    
    const client = redis.createClient({
      url: REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          // Stop retrying after 3 attempts during startup check
          if (retries >= 3) {
            console.warn('Redis connection failed after 3 attempts');
            return false; // stop retrying
          }
          return Math.min(retries * 1000, 3000); // wait up to 3 seconds
        }
      }
    });
    
    client.on('error', (err) => {
      console.error('Redis connection error:', err);
      console.warn('Email notification queue will not work without Redis!');
      console.warn('The application will still function, but new survey notifications will not be sent');
    });
    
    // Set a timeout for the connection attempt
    const timeout = setTimeout(() => {
      console.warn('Redis connection timed out');
      try {
        client.disconnect();
      } catch (e) {
        // Ignore disconnect errors
      }
    }, 5000);
    
    await client.connect();
    clearTimeout(timeout);
    
    console.log('✅ Redis connected successfully');
    await client.disconnect();
    return true;
  } catch (error) {
    console.error('Redis connection error:', error);
    console.warn('Email notification queue will not work without Redis!');
    console.warn('The application will still function, but new survey notifications will not be sent');
    return false;
  }
};

app.use('/', mainRouter)
app.use('/', authRouter)
app.use('/', redemptionRouter)
app.use('/', adminRouter)


// Use the new error handler for file uploads
// app.use(uploadErrorHandler);
// Use the original error handler for other errors
app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);
console.log(process.env.MONGODB_URI)


const port = process.env.PORT || 5000;
app.listen(port, async () => {
  //connect DB
  await connectDB();
  // Check Redis connection for queue service
  await checkRedisConnection();
  console.log(`Server is running on port ${port}\n\nhttp://localhost:${port}`);
});