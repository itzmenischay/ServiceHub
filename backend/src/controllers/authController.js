import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";

import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { generateOTP } from "../utils/generateOTP.js";
import { generateAccessToken } from "../utils/generateToken.js";

import { sendOTPEmail } from "../services/emailService.js";

// Register User
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    await PendingUser.deleteOne({
      email: normalizedEmail,
    });

    const hashedPassword = await hashPassword(password);

    const otp = generateOTP();

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await PendingUser.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      otp,
      otpExpiry,
    });

    await sendOTPEmail(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP and SignUp User
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const pendingUser = await PendingUser.findOne({
      email: normalizedEmail,
    });

    if (!pendingUser) {
      return res.status(404).json({
        success: false,
        message: "No pending registration found",
      });
    }

    if (pendingUser.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (pendingUser.otpExpiry < new Date()) {
      await PendingUser.deleteOne({
        email: normalizedEmail,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password,
      role: pendingUser.role,
    });

    await PendingUser.deleteOne({
      email: normalizedEmail,
    });

    const token = generateAccessToken({
      userId: user._id,
      role: user.role,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login User
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account has been blocked",
      });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateAccessToken({
      userId: user._id,
      role: user.role,
    });

    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Current User
export const getCurrentUser = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};
