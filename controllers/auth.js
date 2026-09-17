const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const jwtSecret = process.env.JWT_SECRET;
const { generateID_users, getVerification } = require("../middleware/helper");
const { url } = require("../middleware/helper");

const postRegister = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      password,
      confirm_password,
      email,
      instituition,
      department,
      faculty,
      gender,
    } = req.body;

    // Validate required fields
    if (
      !email ||
      !password ||
      !confirm_password ||
      !first_name ||
      !last_name ||
      !department ||
      !faculty ||
      !gender
    ) {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "You must fill in all necessary details",
      });
    }

    // Password check
    if (password !== confirm_password) {
      return res.status(401).json({
        status: "failure",
        code: 401,
        msg: "The passwords do not match",
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.verified) {
        return res.status(400).json({
          status: "failure",
          code: 400,
          msg: "Email already exists",
        });
      }

      // User exists but is not verified
      const { verified } = await getVerification(existingUser.id);

      const redirectUrl = verified
        ? req.session.referer || url
        : url + "/verification";

      const token = jwt.sign(
        { userId: existingUser.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_LIFETIME }
      );

      res.cookie("token", token, { httpOnly: true });

      return res.status(200).json({
        status: "success",
        code: 200,
        msg: "User exists but not verified — proceed to verification",
        data: {
          redirectUrl,
          user: existingUser,
        },
        token,
      });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);

    let unique_id = await generateID_users(16);
    while (await User.findOne({ id: unique_id })) {
      unique_id = await generateID_users(16);
    }

    const fullname = `${first_name} ${last_name}`;

    const user = await User.create({
      id: unique_id,
      type: "Normal",
      fullname,
      email,
      instituition,
      department,
      faculty,
      gender,
      password: hashedPassword,
    });

    const { verified } = await getVerification(user.id);
    const redirectUrl = verified
      ? req.session.referer || url
      : url + "/verification";

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_LIFETIME }
    );

    res.cookie("token", token, { httpOnly: true });

    return res.status(201).json({
      status: "success",
      code: 201,
      msg: "User successfully created and signed in",
      data: {
        redirectUrl,
        user,
      },
      token,
    });

  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "Email already exists",
      });
    }

    return res.status(500).json({
      status: "failure",
      code: 500,
      msg: "Something went wrong",
    });
  }
};


const postLogin = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      status: "failure",
      code: 401,
      msg: "Invalid credentials",
    });
  }
  if (!user.password) {
    return res.status(401).json({
      status: "failure",
      code: 401,
      msg: `User ${user.email} uses ${user.type} Login`,
    });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      status: "failure",
      code: 401,
      msg: "Invalid credentials",
    });
  }

  // send verification code to their email.
  const { verified } = await getVerification(user.id);
  let redirectUrl;
  if (verified == true) {
    redirectUrl = req.session.referer || url;
  } else {
    redirectUrl = url + "/verification"; // if not verified redirect to verification page
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  res.cookie("token", token, { httpOnly: true });

  res.status(200).json({
    status: "success",
    code: 200,
    msg: "User successfully logged in",
    data: {
      redirectUrl: redirectUrl,
      user: user,
      // If false, the frontend must redirect the user to phone OTP verification
      // before allowing access to any protected feature (e.g. redemption).
      requiresPhoneVerification: !user.phoneVerified,
    },
    admin: user.admin,
    token,
  });
};

const googleLogin = async (req, res) => {
  // send verification code to their email.
  if (req.user) {
    if (req.user.error) {
      let error = req.user.error;
      return res.status(req.user.statusCode).json({
        status: "failure",
        code: req.user.statusCode,
        msg: error,
      });
    }
  }

  const { verified } = await getVerification(req.user.id);
  const user = await User.findOne({ id: req.user.id });

  let redirectUrl;
  if (verified == true) {
    redirectUrl = req.session.referer || url;
  } else {
    redirectUrl = url + "/verification"; // if not verified redirect to verification page
  }

  const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  res.cookie("token", token, { httpOnly: true });

  res.status(200).json({
    status: "success",
    code: 200,
    msg: "User successfully logged in",
    data: {
      redirectUrl: redirectUrl,
      user: user,
    },
  });
};

const facebookLogin = async (req, res) => {
  if (req.user) {
    if (req.user.error) {
      let error = req.user.error;
      return res.status(req.user.statusCode).json({
        status: "failure",
        code: req.user.statusCode,
        msg: error,
      });
    }
  }
  // send verification code to their email.
  const { verified } = await getVerification(req.user.id);
  const user = await User.findOne({ id: req.user.id });
  let redirectUrl;
  if (verified == true) {
    redirectUrl = req.session.referer || url;
  } else {
    redirectUrl = url + "/verification"; // if not verified redirect to verification page
  }

  const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
  res.cookie("token", token, { httpOnly: true });
  res.status(200).json({
    status: "success",
    code: 200,
    msg: "User successfully logged in",
    data: {
      redirectUrl: redirectUrl,
      user: user,
    },
  });
};

const verify = async (req, res) => {
  const user = await User.findOne({ id: req.userId });
  if (user.verified == true) {
    return res.status(400).json({
      status: "failure",
      code: 400,
      msg: "User verified",
    });
  }
  const { code } = req.body;
  console.log("code body: ", code);

  let code_ = parseInt(code);
  console.log("code body 2: ", code_);
  console.log("user code: ", user.code);

  if (code_ == user.code) {
    const user_ = await User.findOneAndUpdate(
      { id: req.userId },
      { verified: true, code: null },
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      code: 200,
      msg: "User verified",
    });
  } else {
    return res.status(400).json({
      status: "failure",
      code: 400,
      msg: "OTP invalid or expired",
    });
  }
};

const isLoggedIn = async (req, res) => {
  try {
    req.session.referer = req.originalUrl;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "failure",
        code: 401,
        msg: "User is not Logged in: Token not found",
        data: {
          isLoggedIn: false,
        },
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);

    // Find the user by id and verify if they exist
    const user = await User.findOne({ id: decoded.userId });
    if (!user) {
      return res.status(401).json({
        status: "failure",
        code: 401,
        msg: "Token error. User not found",
        data: {
          isLoggedIn: false,
        },
      });
    }

    res.status(200).json({
      status: "success",
      code: 200,
      msg: "User is Logged in",
      data: {
        isLoggedIn: true,
      },
      admin: user.admin,
    });
  } catch (error) {
    console.log(error);
    req.session.referer = req.originalUrl;

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        status: "failure",
        code: 401,
        msg: "User is not Logged in: Invalid token",
        data: {
          isLoggedIn: false,
        },
      });
    }

    res.status(500).json({
      status: "failure",
      code: 500,
      msg: "An Error Occurred: User is not Logged in",
      data: {
        isLoggedIn: false,
        error: error.message || "An error occured",
      },
    });
  }
};

const failurePage = async (req, res) => {
  res.send("Something went wrong");
};

const logout = async (req, res) => {
  res.clearCookie("token");
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).json({
      status: "success",
      code: 200,
      msg: "Successfully logged out",
    });
  });
};

const updateUser = async (req, res) => {
  const { body: data } = req;
  const userId = req.userId; // Ensure that req.userId is validated and sanitized

  if (!userId) {
    return res.status(404).json({
      status: "failure",
      code: 400,
      msg: "User not found",
    });
  }
  const user = await User.findOneAndUpdate(
    { id: userId }, // Use _id for MongoDB queries
    { $set: data }, // Use $set to ensure only specified fields are updated
    {
      runValidators: true,
      new: true, // Return the updated document
      omitUndefined: true, // Optionally omit undefined fields from the update
    }
  );

  if (!user) {
    return res.status(404).json({
      status: "failure",
      code: 400,
      msg: "User not found",
    });
  }

  res.status(200).json({
    status: "success",
    code: 200,
    msg: "User settings successfully updated",
    data: user,
  });
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findOne({ id: userId }).select("-password -code"); // Exclude sensitive fields

    if (!user) {
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      code: 200,
      msg: "User profile retrieved successfully",
      data: {
        user: user,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      status: "failure",
      code: 500,
      msg: "Error retrieving user profile",
      error: error.message,
    });
  }
};

const getUserPoints = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findOne({ id: userId }).select("pointBalance"); // Only select the pointBalance field

    if (!user) {
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      code: 200,
      msg: "User points retrieved successfully",
      data: {
        points: user.pointBalance,
      },
    });
  } catch (error) {
    console.error("Error fetching user points:", error);
    res.status(500).json({
      status: "failure",
      code: 500,
      msg: "Error retrieving user points",
      error: error.message,
    });
  }
};

// Forget Password Controller
// Forget Password — sends a 6-digit OTP to the user's email
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    // Always return 200 to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        status: "success",
        code: 200,
        msg: "If an account exists for this email, a reset code has been sent",
      });
    }

    // Generate 6-digit OTP — consistent with phone/email OTP flow
    const crypto = require("crypto");
    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Hash before storing so a DB read cannot be weaponised to reset accounts
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    user.resetPasswordToken = hashedCode;
    user.resetPasswordExpires = expiresAt;
    await user.save();

    const emailData = {
      to: user.email,
      subject: "SurveyTools Password Reset Code",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset</h2>
                    <p>Hello ${user.fullname},</p>
                    <p>Your password reset code is:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #007bff;">${code}</span>
                    </div>
                    <p><strong>This code expires in 10 minutes.</strong></p>
                    <p>If you did not request a password reset, please ignore this email.</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">This is an automated email from SurveyTools. Do not reply.</p>
                </div>
            `,
    };

    const { addEmailToQueue } = require("../utils/queueService");
    await addEmailToQueue("password-reset", emailData);

    res.status(200).json({
      status: "success",
      code: 200,
      msg: "If an account exists for this email, a reset code has been sent",
    });
  } catch (error) {
    console.error("Error in forget password:", error);
    res.status(500).json({
      status: "failure",
      code: 500,
      msg: "Internal server error",
    });
  }
};

// Reset Password — verifies the 6-digit OTP and sets a new password
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (!email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "email, code, newPassword, and confirmPassword are all required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "Passwords do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "Password must be at least 8 characters long",
      });
    }

    // Hash submitted code to match what we stored
    const crypto = require("crypto");
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    // Atomically consume the token — prevents concurrent reuse of the same OTP
    const user = await User.findOneAndUpdate(
      {
        email,
        resetPasswordToken: hashedCode,
        resetPasswordExpires: { $gt: Date.now() },
      },
      { $unset: { resetPasswordToken: '', resetPasswordExpires: '' } },
      { new: false }
    );

    if (!user) {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "Reset code is invalid or has expired",
      });
    }

    // Token already atomically consumed above — just update the password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    const emailData = {
      to: user.email,
      subject: "SurveyTools Password Reset Successful",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #28a745;">Password Reset Successful</h2>
                    <p>Hello ${user.fullname},</p>
                    <p>Your password has been successfully reset. You can now log in with your new password.</p>
                    <p>If you didn't make this change, contact our support team immediately.</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">This is an automated email from SurveyTools. Do not reply.</p>
                </div>
            `,
    };

    const { addEmailToQueue } = require("../utils/queueService");
    await addEmailToQueue("password-reset-confirmation", emailData);

    res.status(200).json({
      status: "success",
      code: 200,
      msg: "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Error in reset password:", error);
    res.status(500).json({
      status: "failure",
      code: 500,
      msg: "Internal server error",
    });
  }
};

module.exports = {
  getVerification,
  verify,
  failurePage,
  postLogin,
  logout,
  postRegister,
  isLoggedIn,
  googleLogin,
  facebookLogin,
  updateUser,
  getUserProfile,
  getUserPoints,
  forgetPassword,
  resetPassword,
};
