import User from "../models/User.js";
import ProviderProfile from "../models/ProviderProfile.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";
import AppError from "../utils/AppError.js";

// Get Admin Dashboard Stats
export const getDashboardStats = async (req, res, next) => {
  try {
    // users
    const totalUsers = await User.countDocuments();

    const totalCustomers = await User.countDocuments({
      role: "customer",
    });

    const totalProviders = await User.countDocuments({
      role: "provider",
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    // bookings
    const totalBookings = await Booking.countDocuments();

    const pendingBookings = await Booking.countDocuments({
      status: "pending",
    });

    const acceptedBookings = await Booking.countDocuments({
      status: "accepted",
    });

    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });

    const rejectedBookings = await Booking.countDocuments({
      status: "rejected",
    });

    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });

    // payments
    const paymentStats = await Payment.aggregate([
      {
        $match: {
          status: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
          },
          totalTransactions: {
            $sum: 1,
          },
        },
      },
    ]);

    // reviews
    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: {
            $sum: 1,
          },
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalCustomers,
        totalProviders,
        totalAdmins,

        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,

        totalRevenue: paymentStats[0]?.totalRevenue || 0,
        totalTransactions: paymentStats[0]?.totalTransactions || 0,

        totalReviews: reviewStats[0]?.totalReviews || 0,
        averageRating: Number(reviewStats[0]?.averageRating?.toFixed(1)) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get All Users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Get Single User
export const getSingleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update User Role
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.role = role;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete User
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get All Providers
export const getAllProviders = async (req, res, next) => {
  try {
    const providers = await ProviderProfile.find()
      .populate("user", "name email isBlocked")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    next(error);
  }
};

// Get Provider Details
export const getProviderDetails = async (req, res, next) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id)
      .populate("user", "name email phone avatar isBlocked")
      .populate("category", "name");

    if (!provider) {
      return next(new AppError("Provider not found", 404));
    }

    res.status(200).json({
      success: true,
      provider,
    });
  } catch (error) {
    next(error);
  }
};

// Verify Provider
export const verifyProvider = async (req, res, next) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id);

    if (!provider) {
      return next(new AppError("Provider not found", 404));
    }

    provider.isVerified = true;

    await provider.save();

    res.status(200).json({
      success: true,
      message: "Provider verified successfully",
      provider,
    });
  } catch (error) {
    next(error);
  }
};

// Unverify Provider
export const unverifyProvider = async (req, res, next) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id);

    if (!provider) {
      return next(new AppError("Provider not found", 404));
    }

    provider.isVerified = false;

    await provider.save();

    res.status(200).json({
      success: true,
      message: "Provider verification removed",
      provider,
    });
  } catch (error) {
    next(error);
  }
};

// Block Provider
export const blockProvider = async (req, res, next) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id).populate(
      "user",
    );

    if (!provider) {
      return next(new AppError("Provider not found", 404));
    }

    provider.user.isBlocked = true;

    await provider.user.save();

    res.status(200).json({
      success: true,
      message: "Provider blocked successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Unblock Provider
export const unblockProvider = async (req, res, next) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id).populate(
      "user",
    );

    if (!provider) {
      return next(new AppError("Provider not found", 404));
    }

    provider.user.isBlocked = false;

    await provider.user.save();

    res.status(200).json({
      success: true,
      message: "Provider unblocked successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get All Bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "name email")
      .populate("provider", "name email")
      .populate("paymentId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Booking
export const getBookingDetails = async (req, res, next) => {
  try {
    const Booking = await Booking.findById(req.params.id)
      .populate("customer", "name email")
      .populate("provider", "name email")
      .populate("paymentId");

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel Booking By Admin
export const cancelBookingByAdmin = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    booking.status = "cancelled";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// Complete Booking By Admin
export const completeBookingByAdmin = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    booking.status = "completed";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking marked as complete",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// Get Booking Stats
export const getBookingStats = async (req, res, next) => {
  try {
    const totalBookings = await Booking.countDocuments();

    const pendingBookings = await Booking.countDocuments({ status: "pending" });

    const acceptedBookings = await Booking.countDocuments({
      status: "accepted",
    });

    const rejectedBookings = await Booking.countDocuments({
      status: "rejected",
    });

    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });

    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        acceptedBookings,
        rejectedBookings,
        completedBookings,
        cancelledBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Payment Summary
export const getPaymentSummary = async (req, res, next) => {
  try {
    const summary = await Payment.aggregate([
      {
        $match: {
          status: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
          },
          totalTransactions: {
            $sum: 1,
          },
          averageTransactionValue: {
            $avg: "$amount",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      summary: summary[0] || {
        totalRevenue: 0,
        totalTransactions: 0,
        averageTransactionValue: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Monthly Revenue
export const getMonthlyRevenue = async (req, res, next) => {
  try {
    const revenue = await Payment.aggregate([
      {
        $match: {
          status: "paid",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: {
            $sum: "$amount",
          },
          transactions: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      revenue,
    });
  } catch (error) {
    next(error);
  }
};

// Get Payment Stats
export const getPaymentStatusStats = async (req, res, next) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// Get Top Providers
export const getTopProviders = async (req, res, next) => {
  try {
    const providers = await Payment.aggregate([
      {
        $match: {
          status: "paid",
        },
      },
      {
        $group: {
          _id: "$provider",
          totalEarnings: {
            $sum: "$amount",
          },
          totalJobs: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          totalEarnings: -1,
        },
      },
      {
        $limit: 10,
      },
    ]);

    res.status(200).json({
      success: true,
      providers,
    });
  } catch (error) {
    next(error);
  }
};

// Get Recent Transactions
export const getRecentTransactions = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate("customer", "name email")
      .populate("provider", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// Get Review Summary
export const getReviewSummary = async (req, res, next) => {
  try {
    const summary = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: {
            $sum: 1,
          },
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      summary: {
        totalReviews: summary[0]?.totalReviews || 0,
        averageRating: Number(summary[0]?.averageRating?.toFixed(1)) || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Rating Distribution
export const getRatingDistribution = async (req, res, next) => {
  try {
    const distribution = await Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      distribution,
    });
  } catch (error) {
    next(error);
  }
};

// Get Top Rated Providers
export const getTopRatedProviders = async (req, res, next) => {
  try {
    const providers = await ProviderProfile.find({
      totalReviews: { $gt: 0 },
    })
      .populate("user", "name email")
      .sort({
        averageRating: -1,
      })
      .limit(10);

    res.status(200).json({
      success: true,
      providers,
    });
  } catch (error) {
    next(error);
  }
};

// Get Lowest Rated Providers
export const getLowestRatedProviders = async (req, res, next) => {
  try {
    const providers = await ProviderProfile.find({
      totalReviews: { $gt: 0 },
    })
      .populate("user", "name email")
      .sort({
        averageRating: 1,
      })
      .limit(10);

    res.status(200).json({
      success: true,
      providers,
    });
  } catch (error) {
    next(error);
  }
};

// Get Recent Reviews
export const getRecentReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate("customer", "name email")
      .populate("provider", "name email")
      .sort({
        createdAt: -1,
      })
      .limit(10);

    res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// Get Recent Users
export const getRecentUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort("{createdAt: -1")
      .limit(10);

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Get Recent Bookings
export const getRecentBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "name email")
      .populate("provider", "name email")
      .sort({ createdAt: -1 })
      .limti(10);

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Get Recent Payments
export const getRecentPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate("customer", "name email")
      .populate("provider", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// Get Recent Activites
export const getRecentActivities = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const bookings = await Booking.find()
      .populate("customer", "name")
      .populate("provider", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const payments = await Payment.find()
      .populate("customer", "name")
      .populate("provider", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    const reviews = await Review.find()
      .populate("customer", "name")
      .populate("provider", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      activities: {
        users,
        bookings,
        payments,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

