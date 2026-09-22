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
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const redoc = require('redoc-express');

const User = require('./model/user')


const authRouter = require('./routes/auth')
const mainRouter = require('./routes/main')
const redemptionRouter = require('./routes/redemption')
const adminRouter = require('./routes/admin');
const gamificationRouter = require('./routes/gamification');
const gamificationNewRouter = require('./src/gamification/gamification.routes');
const adminGamificationNewRouter = require('./src/admin-gamification/admin-gamification.routes');
const errorHandlerMiddleware = require('./middleware/error-handler')
const uploadErrorHandler = require('./middleware/errorHandler')
const notFoundMiddleware = require('./middleware/not-found');
const respondentLayer1Routes = require('./src/kyc/respondent-layer1.routes');
const respondentLayer2Routes = require('./src/kyc/respondent-layer2.routes');
const respondentSensitiveLayersRoutes = require('./src/kyc/respondent-sensitive-layers.routes');
const consentRoutes = require('./src/kyc/consent.routes');
const { loadTelecomCatalog } = require("./services/telecom/catalogCache");
const { syncTelecomCatalog } = require("./services/flutterwave/syncCatalog");
const phoneOtpRoutes = require('./src/kyc/phone-otp.routes');
const emailOtpRoutes = require('./src/kyc/email-otp.routes');
const signupRoutes = require('./src/kyc/signup.routes');
const researcherProfileRoutes = require('./src/kyc/researcher-profile.routes');
const erasureRoutes = require('./src/kyc/erasure.routes');
const researcherTierRoutes = require('./src/kyc/researcher-tier.routes');

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

// Load the raw specs
const kycSwaggerDoc = YAML.load(path.join(__dirname, 'docs', 'survey-tools-kyc.openapi.yaml'));
const fullSwaggerDoc = YAML.load(path.join(__dirname, 'docs', 'surveytools-full.openapi.yaml'));

// Assign a proper tag heading to all KYC endpoints instead of "default"
if (kycSwaggerDoc && kycSwaggerDoc.paths) {
  Object.keys(kycSwaggerDoc.paths).forEach(pathKey => {
    const pathObj = kycSwaggerDoc.paths[pathKey];
    Object.keys(pathObj).forEach(method => {
      if (typeof pathObj[method] === 'object') {
        pathObj[method].tags = ['0. KYC Unified Integration'];
      }
    });
  });
}

// Dynamically merge them into one giant API spec
const mergedSwaggerDoc = {
  ...fullSwaggerDoc,
  info: {
    ...fullSwaggerDoc.info,
    title: 'SurveyTools Comprehensive API'
  },
  paths: {
    ...fullSwaggerDoc.paths,
    ...kycSwaggerDoc.paths
  },
  components: {
    ...fullSwaggerDoc.components,
    schemas: {
      ...(fullSwaggerDoc.components?.schemas || {}),
      ...(kycSwaggerDoc.components?.schemas || {})
    },
    securitySchemes: {
      ...(fullSwaggerDoc.components?.securitySchemes || {}),
      ...(kycSwaggerDoc.components?.securitySchemes || {})
    }
  }
};

// Mount Swagger UI as a single page
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(mergedSwaggerDoc, { 
  customSiteTitle: "SurveyTools Comprehensive API Docs" 
}));

// Raw JSON endpoint
app.get('/api-docs.json', (req, res) => res.json(mergedSwaggerDoc));

// ReDoc UI documentation
app.get('/redoc', redoc({ title: 'SurveyTools Unified API Docs', specUrl: '/api-docs.json' }));
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


// Check Redis availability with a quick TCP probe (no ioredis client needed)
const checkRedisConnection = () => {
  const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  let host = '127.0.0.1';
  let port = 6379;
  try {
    const parsed = new URL(REDIS_URL);
    host = parsed.hostname || host;
    port = parseInt(parsed.port, 10) || port;
  } catch (_) {}

  return new Promise((resolve) => {
    const net = require('net');
    const socket = net.createConnection({ host, port });
    const timer = setTimeout(() => { socket.destroy(); resolve(false); }, 2000);

    socket.on('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      console.log('✅ Redis connected successfully');
      resolve(true);
    });

    socket.on('error', () => {
      clearTimeout(timer);
      console.warn(`⚠️ Redis unavailable at ${REDIS_URL}. Email notifications queue is disabled; the app will still function normally.`);
      resolve(false);
    });
  });
};






app.use('/', mainRouter)
app.use('/', authRouter)
app.use('/', redemptionRouter)
const marketplaceRouter = require('./routes/marketplace');
const visualizationRouter = require('./routes/visualization');
app.use('/v1/kyc', respondentLayer1Routes);
app.use('/v1/kyc', respondentLayer2Routes);
app.use('/v1/kyc', respondentSensitiveLayersRoutes);
app.use('/v1/kyc', consentRoutes);
const analyticsRouter = require('./routes/analytics');

app.use('/v1/kyc', signupRoutes);
app.use('/v1/kyc', researcherProfileRoutes);
app.use('/v1/kyc', erasureRoutes);
app.use('/v1/kyc', researcherTierRoutes);

app.use('/', adminRouter);
app.use('/', gamificationRouter);
// New gamification additions — additive only, never modifies existing routes
app.use('/', gamificationNewRouter);
app.use('/', adminGamificationNewRouter);
app.use('/', marketplaceRouter);
app.use('/', visualizationRouter);
app.use('/', analyticsRouter);


// KYC routes — additive, never modifies existing routes
app.use('/v1/kyc', phoneOtpRoutes);

// Email OTP
app.use('/v1/kyc', emailOtpRoutes);
// Use the new error handler for file uploads
// app.use(uploadErrorHandler);
// Use the original error handler for other errors
app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);



const bootstrap = async () => {
  try {
    // Sync & load telecom catalog
    // await syncTelecomCatalog();
    // await loadTelecomCatalog();

    // Connect DB
    await connectDB();

    // Check Redis
    await checkRedisConnection();

    // Start Cron Jobs
    const initGamificationCron = require('./services/gamificationCron');
    initGamificationCron();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(
        `🚀 Server running on port ${port}\nhttp://localhost:${port}`
      );
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

bootstrap();


