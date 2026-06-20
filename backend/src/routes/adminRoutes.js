import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
  getAllProviders,
  getProviderDetails,
  verifyProvider,
  unverifyProvider,
  blockProvider,
  unblockProvider,
  getAllBookings,
  getBookingDetails,
  cancelBookingByAdmin,
  completeBookingByAdmin,
  getBookingStats,
  getPaymentSummary,
  getMonthlyRevenue,
  getPaymentStatusStats,
  getTopProviders,
  getRecentTransactions,
  getReviewSummary,
  getRatingDistribution,
  getLowestRatedProviders,
  getRecentReviews,
  getRecentUsers,
  getRecentBookings,
  getRecentPayments,
  getRecentActivities,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("admin"), getDashboardStats);

// User Management Routes
router.get("/dashboard/users", protect, authorize("admin"), getAllUsers);
router.get("/dashboard/users/:id", protect, authorize("admin"), getSingleUser);
router.put(
  "/dashboard/users/:id/role",
  protect,
  authorize("admin"),
  updateUserRole,
);
router.delete("/dashboard/users/:id", protect, authorize("admin"), deleteUser);

// Provider Management Routes
router.get("/dashboard/providers", protect, authorize("admin"), getAllProviders)
router.get("/dashboard/providers/:id", protect, authorize("admin"), getProviderDetails)
router.put("/dashboard/providers/:id/verify", protect, authorize("admin"), verifyProvider)
router.put("/dashboard/providers/:id/unverify", protect, authorize("admin"), unverifyProvider)
router.put("/dashboard/providers/:id/block", protect, authorize("admin"), blockProvider)
router.put("/dashboard/providers/:id/unblock", protect, authorize("admin"), unblockProvider)

// Booking Management Routes
router.get("/dashboard/bookings", protect, authorize("admin"), getAllBookings)
router.get("/dashboard/bookings/stats", protect, authorize("admin"), getBookingStats)
router.get("/dashboard/bookings/:id", protect, authorize("admin"), getBookingDetails)
router.put("/dashboard/bookings/:id/cancel", protect, authorize("admin"), cancelBookingByAdmin)
router.put("/dashboard/bookings/:id/complete", protect, authorize("admin"), completeBookingByAdmin)

// Payment Management Routes
router.get("/dashboard/payments/summary", protect, authorize("admin"), getPaymentSummary)
router.get("/dashboard/payments/monthly", protect, authorize("admin"), getMonthlyRevenue)
router.get("/dashboard/payments/status", protect, authorize("admin"), getPaymentStatusStats)
router.get("/dashboard/payments/top-providers", protect, authorize("admin"), getTopProviders)
router.get("/dashboard/payments/recents", protect, authorize("admin"), getRecentTransactions)

// Reviews Management Routes
router.get("/review/summary", protect, authorize("admin"), getReviewSummary)
router.get("/reviews/distribution", protect, authorize("admin"), getRatingDistribution)
router.get("/reviews/top-providers", protect, authorize("admin"), getTopProviders)
router.get("/reviews/lowest-providers", protect, authorize("admin"), getLowestRatedProviders)
router.get("/reviews/recent", protect, authorize("admin"), getRecentReviews)

// Recent Activities
router.get("/recent/users", protect, authorize("admin"), getRecentUsers)
router.get("/recent/bookings", protect, authorize("admin"), getRecentBookings)
router.get("/recent/payments", protect, authorize("admin"), getRecentPayments)
router.get("/recent/recent-activities", protect, authorize("admin"), getRecentActivities)


export default router;
