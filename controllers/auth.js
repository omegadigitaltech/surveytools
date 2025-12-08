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

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "User with this email does not exist",
      });
    }

    // Generate reset token
    const crypto = require("crypto");
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token and save to database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set token and expiry (10 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Email content
    const emailData = {
      to: user.email,
      subject: "Password Reset Request - SurveyPro",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello ${user.fullname},</p>
                    <p>We received a request to reset your password for your SurveyPro account.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" 
                           style="background-color: #007bff; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
                    <p><strong>This link will expire in 10 minutes.</strong></p>
                    <p>If you didn't request this password reset, please ignore this email.</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated email from SurveyPro. Please do not reply to this email.
                    </p>
                </div>
            `,
    };

    // Send email using existing queue service
    const { addEmailToQueue } = require("../utils/queueService");
    await addEmailToQueue("password-reset", emailData);

    res.status(200).json({
      status: "success",
      code: 200,
      msg: "Password reset link has been sent to your email",
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

// Reset Password Controller
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "Token, new password, and confirm password are required",
      });
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "Passwords do not match",
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "Password must be at least 6 characters long",
      });
    }

    // Hash the token
    const crypto = require("crypto");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "Token is invalid or has expired",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    const emailData = {
      to: user.email,
      subject: "Password Reset Successful - SurveyPro",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #28a745;">Password Reset Successful</h2>
                    <p>Hello ${user.fullname},</p>
                    <p>Your password has been successfully reset for your SurveyPro account.</p>
                    <p>You can now log in with your new password.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL}/login" 
                           style="background-color: #28a745; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Login Now
                        </a>
                    </div>
                    <p>If you didn't make this change, please contact our support team immediately.</p>
                    <hr style="margin: 30px 0;">
                    <p style="color: #666; font-size: 12px;">
                        This is an automated email from SurveyPro. Please do not reply to this email.
                    </p>
                </div>
            `,
    };

    const { addEmailToQueue } = require("../utils/queueService");
    await addEmailToQueue("password-reset-confirmation", emailData);

    res.status(200).json({
      status: "success",
      code: 200,
      msg: "Password has been reset successfully. You can now login with your new password.",
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
