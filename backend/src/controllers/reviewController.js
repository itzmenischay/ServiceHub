import mongoose from "mongoose";
import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import ProviderProfile from "../models/ProviderProfile.js";
import AppError from "../middleware/errorMiddleware.js";

// Create Review
export const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Booking must belong to customer
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only review your own bookings",
      });
    }

    // Booking must be completed
    if (booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "You can only review completed bookings",
      });
    }

    // One review per booking
    const existingReview = await Review.findOne({
      booking: bookingId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Review already submitted for this booking",
      });
    }

    // Create review
    const review = await Review.create({
      customer: req.user._id,
      provider: booking.provider,
      booking: bookingId,
      rating,
      comment,
    });

    // Calculate provider statistics
    const stats = await Review.aggregate([
      {
        $match: {
          provider: new mongoose.Types.ObjectId(booking.provider),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    // Update provider profile
    await ProviderProfile.findOneAndUpdate(
      { user: booking.provider },
      {
        averageRating: Number(stats[0].averageRating.toFixed(1)),
        totalReviews: stats[0].totalReviews,
      },
    );

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

// Get Provider Reviews
export const getProviderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      provider: req.params.providerId,
    })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};
