import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";
import PasswordResetOTP from "../models/PasswordResetOTP.js";

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
      return next(new AppError("User already exists", 409));
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

    await sendOTPEmail(normalizedEmail, otp, "verification");

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Resend Registration OTP
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const pendingUser = await PendingUser.findOne({
      email: normalizedEmail,
    });

    if (!pendingUser) {
      return next(new AppError("No pending registration found", 404));
    }

    // OTP spam prevention
    if (
      pendingUser.lastSentAt &&
      Date.now() - pendingUser.lastSentAt.getTime() < 60 * 1000
    ) {
      return next(
        new AppError(
          "Please wait 60 seconds before requesting another OTP.",
          429,
        ),
      );
    }

    const otp = generateOTP();

    pendingUser.otp = otp;
    pendingUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    pendingUser.lastSentAt = new Date();

    await pendingUser.save();

    await sendOTPEmail(normalizedEmail, otp, "verification");

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
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
      return next(new AppError("No pending registration found", 404));
    }

    if (pendingUser.otp !== otp) {
      return next(new AppError("Invalid OTP", 400));
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
      return next(new AppError("Email and password are required", 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return next(new AppError("Invalid Credentials", 400));
    }

    if (user.isBlocked) {
      return next(new AppError("Account has been blocked", 403));
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return next(new AppError("Invalid Credentials", 400));
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

// Forgot Password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check for existing password reset request
    const existingRequest = await PasswordResetOTP.findOne({
      email: normalizedEmail,
    });

    if (existingRequest) {
      // OTP spam prevention
      if (
        existingRequest.lastSentAt &&
        Date.now() - existingRequest.lastSentAt.getTime() < 60 * 1000
      ) {
        return next(
          new AppError(
            "Please wait 60 seconds before requesting another OTP.",
            429,
          ),
        );
      }

      await existingRequest.deleteOne();
    }

    const otp = generateOTP();

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await PasswordResetOTP.create({
      email: normalizedEmail,
      otp,
      otpExpiry,
    });

    await sendOTPEmail(normalizedEmail, otp, "passwordReset");

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Resend Password Reset OTP
export const resendResetOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const resetRequest = await PasswordResetOTP.findOne({
      email: normalizedEmail,
    });

    if (!resetRequest) {
      return next(new AppError("No password reset request found", 404));
    }

    // OTP spam prevention
    if (
      resetRequest.lastSentAt &&
      Date.now() - resetRequest.lastSentAt.getTime() < 60 * 1000
    ) {
      return next(
        new AppError(
          "Please wait 60 seconds before requesting another OTP.",
          429,
        ),
      );
    }

    const otp = generateOTP();

    resetRequest.otp = otp;
    resetRequest.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    resetRequest.isVerified = false;
    resetRequest.verifiedAt = null;
    resetRequest.lastSentAt = new Date();

    await resetRequest.save();

    await sendOTPEmail(normalizedEmail, otp, "passwordReset");

    return res.status(200).json({
      success: true,
      message: "Password reset OTP resent successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Verify Reset OTP
export const verifyResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new AppError("Email and OTP are required", 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const resetRequest = await PasswordResetOTP.findOne({
      email: normalizedEmail,
    });

    if (!resetRequest) {
      return next(new AppError("No password reset request found", 404));
    }

    if (resetRequest.otp !== otp) {
      return next(new AppError("Invalid OTP", 400));
    }

    if (resetRequest.otpExpiry < new Date()) {
      await PasswordResetOTP.deleteOne({
        email: normalizedEmail,
      });

      return next(new AppError("OTP has expired", 400));
    }

    resetRequest.isVerified = true;
    resetRequest.verifiedAt = new Date();
    await resetRequest.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password
export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return next(
        new AppError(
          "Email, new password and confirm password are required",
          400,
        ),
      );
    }

    if (newPassword !== confirmPassword) {
      return next(new AppError("Passwords do not match", 400));
    }

    const normalizedEmail = email.toLowerCase().trim();

    const resetRequest = await PasswordResetOTP.findOne({
      email: normalizedEmail,
    });

    if (!resetRequest) {
      return next(new AppError("No password reset request found", 404));
    }

    if (!resetRequest.isVerified) {
      return next(new AppError("Please verify OTP first", 400));
    }

    // Verified OTP expires after 10 minutes
    if (
      !resetRequest.verifiedAt ||
      Date.now() - resetRequest.verifiedAt.getTime() > 10 * 60 * 1000
    ) {
      await PasswordResetOTP.deleteOne({
        email: normalizedEmail,
      });

      return next(
        new AppError(
          "Password reset session has expired. Please request a new OTP.",
          400,
        ),
      );
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const isSamePassword = await comparePassword(newPassword, user.password);

    if (isSamePassword) {
      return next(
        new AppError(
          "New password cannot be the same as your current password",
          400,
        ),
      );
    }

    user.password = await hashPassword(newPassword);

    await user.save();

    await PasswordResetOTP.deleteOne({
      email: normalizedEmail,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Change Password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(
        new AppError(
          "Current password, new password and confirm password are required",
          400,
        ),
      );
    }

    if (newPassword !== confirmPassword) {
      return next(new AppError("Passwords do not match", 400));
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const isCurrentPasswordCorrect = await comparePassword(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordCorrect) {
      return next(new AppError("Current password is incorrect", 400));
    }

    const isSamePassword = await comparePassword(newPassword, user.password);

    if (isSamePassword) {
      return next(
        new AppError(
          "New password cannot be the same as the current password",
          400,
        ),
      );
    }

    user.password = await hashPassword(newPassword);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};
