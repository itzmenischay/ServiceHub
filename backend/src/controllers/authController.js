import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";

import { hashPassword, comparePassword } from "../utils/hashPassword.js";
import { generateOTP } from "../utils/generateOTP.js";
import { generateAccessToken } from "../utils/generateToken.js";

import { sendOTPEmail } from "../services/emailService.js";

import AppError from "../utils/AppError.js";

// Register User
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return next(new AppError("All fields are required", 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return next(new AppError("User already exists", 409))
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
      return next(new AppError("Email and OTP are required", 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const pendingUser = await PendingUser.findOne({
      email: normalizedEmail,
    });

    if (!pendingUser) {
      return next(new AppError("No pending registration found", 404))
    }

    if (pendingUser.otp !== otp) {
      return next(new AppError("Invalid OTP", 400))
    }

    if (pendingUser.otpExpiry < new Date()) {
      await PendingUser.deleteOne({
        email: normalizedEmail,
      });

      return next(new AppError("OTP has expired", 400));
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
      return next(new AppError("Email and password are required", 400))
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return next(new AppError("Invalid Credentials", 400))
    }

    if (user.isBlocked) {
      return next(new AppError("Account has been blocked", 403))
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return next(new AppError("Invalid Credentials", 400))
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
