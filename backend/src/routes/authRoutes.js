import express from "express";

import {
  registerUser,
  verifyOTP,
  loginUser,
  getCurrentUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  changePassword,
  resendOTP,
  resendResetOTP,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/resent-otp", resendOTP);

router.post("/verify-otp", verifyOTP);

router.post("/login", loginUser);

router.get("/me", protect, getCurrentUser);

router.post("/forgot-password", forgotPassword);

router.post("/resend-reset-otp", resendResetOTP);

router.post("/verify-reset-otp", verifyResetOTP);

router.post("/reset-password", resetPassword);

router.patch("/change-password", protect, changePassword);
export default router;
