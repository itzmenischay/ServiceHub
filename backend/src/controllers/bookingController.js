import Booking from "../models/Booking.js";
import { createNotification } from "../services/notificationService.js";
import AppError from "../utils/AppError.js";

// Create Booking
export const createBooking = async (req, res, next) => {
  try {
    const { providerId, categoryId, serviceDate, address, description, hours } =
      req.body;

    // find provider profile
    const providerProfile = await ProviderProfile.findOne({
      user: providerId,
    });

    if (!providerProfile) {
      return next(new AppError("Provider profile not found", 404));
    }

    // calculate pricing
    const hourlyRate = providerProfile.hourlyRate;
    const amount = hourlyRate * hours;

    // create booking
    const booking = await Booking.create({
      customer: req.user._id,
      provider: providerId,
      providerProfile: providerProfile._id,
      category: categoryId,
      serviceDate,
      address,
      description,
      hours,
      hourlyRateAtBookingTime: hourlyRate,
      amount,
    });

    await createNotification({
      recipient: provider._id,
      sender: req.user._id,
      type: "booking",
      title: "New Booking Request",
      message: "You have received a new booking request.",
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
      .populate("paymentId")
      .sort({ createdAt: -1 });

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
      .populate("providerProfile")
      .populate("category", "name")
      .populate("paymentId")
      .sort({ createdAt: -1 });

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

    await createNotification({
      recipient: booking.customer,
      sender: req.user._id,
      type: "booking",
      title: "Booking Accepted",
      message: "Your booking has been accepted.",
    });

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

    await createNotification({
      recipient: booking.customer,
      sender: req.user._id,
      type: "booking",
      title: "Booking Rejected",
      message: "Your booking request has been rejected.",
    });

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

    await createNotification({
      recipient: booking.customer,
      sender: req.user._id,
      type: "booking",
      title: "Service Completed",
      message: "Your service has been marked as completed.",
    });

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

    await createNotification({
      recipient: provider._id,
      sender: req.user._id,
      type: "booking",
      title: "Booking Cancelled",
      message: "A booking has been cancelled.",
    });

    res.status(200).json({
      success: true,
      message: "Booking cancelled",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
