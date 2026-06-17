import express from "express";
import {
  getProviderEarnings,
  getMonthlyEarnings,
} from "../controllers/earningController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, authorize("provider"), getProviderEarnings);

router.get("/monthly", protect, authorize("provider"), getMonthlyEarnings);

export default router;
