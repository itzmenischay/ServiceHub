import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  refundPayment,
} from "../controllers/paymentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// customer only
router.post(
  "/create-order",
  protect,
  authorize("customer"),
  createPaymentOrder,
);

router.post("/verify", protect, authorize("customer"), verifyPayment);

// customer, provider and admin
router.get(
  "/history",
  protect,
  authorize("customer", "provider", "admin"),
  getPaymentHistory,
);

// admin only refund
router.post("/refund/:paymentId", protect, authorize("admin"), refundPayment);

export default router;
