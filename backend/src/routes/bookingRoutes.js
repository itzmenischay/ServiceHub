import express from "express";
import {
  createBooking,
  getMyBookings,
  getProviderBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
  cancelBooking,
} from "../controllers/bookingController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("customer"), createBooking);

router.get("/my-bookings", protect, authorize("customer"), getMyBookings);

router.get(
  "/provider-bookings",
  protect,
  authorize("provider"),
  getProviderBookings,
);

router.patch("/:id/accept", protect, authorize("provider"), acceptBooking);

router.patch("/:id/reject", protect, authorize("provider"), rejectBooking);

router.patch("/:id/complete", protect, authorize("provider"), completeBooking);

router.patch("/:id/cancel", protect, authorize("customer"), cancelBooking);

export default router;
