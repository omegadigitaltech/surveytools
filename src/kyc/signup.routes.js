'use strict';

const express = require('express');

const { createSignupService } = require('./signup.service');
const { createSignupController } = require('./signup.controller');

const router = express.Router();

const signupService = createSignupService();
const { register } = createSignupController({ signupService });

router.post('/register', register);

module.exports = router;
