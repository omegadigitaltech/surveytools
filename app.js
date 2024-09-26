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

const User = require('./model/user')


const authRouter = require('./routes/auth')
const mainRouter = require('./routes/main')
const errorHandlerMiddleware = require('./middleware/error-handler')
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


app.use('/', mainRouter)
app.use('/', authRouter)


// //error handler
app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);


const port = process.env.PORT || 5000;
app.listen(port, async () => {
  //connect DB
  await connectDB();
  console.log(`Server is running on port ${port}\n\nhttp://localhost:${port}`);
});