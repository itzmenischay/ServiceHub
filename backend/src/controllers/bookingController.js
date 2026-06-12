import Booking from "../models/Booking.js";
import AppError from "../utils/AppError.js";

// Create Booking
export const createBooking = async (req, res, next) => {
  try {
    const booking = await Booking.create({
      customer: req.user._id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Get Customer Bookings
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      customer: req.user._id,
    })
      .populate("provider", "name email")
      .populate("providerProfile")
      .populate("category", "name")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Get Provider Bookings
export const getProviderBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      provider: req.user._id,
    })
      .populate("customer", "name email")
      .populate("category", "name")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// Accept Booking
export const acceptBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    booking.status = "accepted";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking accepted",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Reject Booking
export const rejectBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    booking.status = "rejected";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking rejected",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Complete Booking
export const completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    booking.status = "completed";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking completed",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Cancel Booking
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    booking.status = "cancelled";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
