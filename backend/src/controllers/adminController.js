import User from "../models/User.js";
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
