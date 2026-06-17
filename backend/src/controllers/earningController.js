import Payment from "../models/Payment.js";
import AppError from "../utils/AppError.js";

// Get Provider Earnings
export const getProviderEarnings = async (req, res, next) => {
  try {
    if (req.user.role !== "provider") {
      return next(new AppError("Access Denied", 403));
    }

    const payments = await Payment.find({
      provider: req.user._id,
      status: "paid",
    });

    const totalEarnings = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );

    res.status(200).json({
      success: true,
      totalJobs: payments.length,
      totalEarnings,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// Get Monthly Earnings
export const getMonthlyEarnings = async (req, res, next) => {
  try {
    const earnings = await Payment.aggregate([
      {
        $match: {
          provider: req.user._id,
          status: "paid",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
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
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      earnings,
    });
  } catch (error) {
    next(error);
  }
};
