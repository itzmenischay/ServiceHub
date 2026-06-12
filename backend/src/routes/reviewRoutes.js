import express from "express";
import {
  createReview,
  getProviderReviews,
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route
router.get("/provider/:providerId", getProviderReviews);

// Customer only
router.post("/", protect, authorize("customer"), createReview);

export default router;
