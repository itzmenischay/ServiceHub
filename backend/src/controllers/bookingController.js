import Booking from "../models/Booking.js";
import ProviderProfile from "../models/ProviderProfile.js";
import Availability from "../models/Availability.js";
import { createNotification } from "../services/notificationService.js";
import AppError from "../utils/AppError.js";

const getDayName = (date) => {
  return new Date(date)
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toLowerCase();
};

const timeToMinutes = (time) => {
  if (!time || typeof time !== "string") {
    throw new AppError("Invalid time format.", 400);
  }

  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

// Create Booking
export const createBooking = async (req, res, next) => {
  try {
    const {
      providerId,
      categoryId,
      serviceDate,
      startTime,
      address,
      description,
      hours,
    } = req.body;

    // Validate required booking fields
    if (!startTime) {
      return next(new AppError("Start time is required.", 400));
    }

    if (!hours || hours < 1) {
      return next(new AppError("Hours must be at least 1.", 400));
    }

    // Find provider profile
    const providerProfile = await ProviderProfile.findOne({
      user: providerId,
    });

    if (!providerProfile) {
      return next(new AppError("Provider profile not found", 404));
    }

    // Check provider availability
    const availability = await Availability.findOne({
      provider: providerId,
    });

    if (!availability) {
      return next(
        new AppError("Provider has not configured availability yet.", 400),
      );
    }

    // Check unavailable dates
    const selectedDate = new Date(serviceDate).toISOString().split("T")[0];

    const isUnavailable = availability.unavailableDates.some(
      (date) => date.toISOString().split("T")[0] === selectedDate,
    );

    if (isUnavailable) {
      return next(
        new AppError("Provider is unavailable on the selected date.", 400),
      );
    }

    // Check provider works on selected day
    const day = getDayName(serviceDate);

    const daySchedule = availability.weeklySchedule[day];

    if (!daySchedule || daySchedule.length === 0) {
      return next(new AppError(`Provider is not available on ${day}.`, 400));
    }

    // Validate booking time
    const bookingStart = timeToMinutes(startTime);
    const bookingEnd = bookingStart + hours * 60;

    const isWithinWorkingHours = daySchedule.some((slot) => {
      const slotStart = timeToMinutes(slot.startTime);
      const slotEnd = timeToMinutes(slot.endTime);

      return bookingStart >= slotStart && bookingEnd <= slotEnd;
    });

    if (!isWithinWorkingHours) {
      return next(
        new AppError(
          "Selected time is outside the provider's working hours.",
          400,
        ),
      );
    }

    // Check for overlapping bookings
    const startOfDay = new Date(serviceDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(serviceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      provider: providerId,
      serviceDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: {
        $in: ["pending", "accepted"],
      },
    });

    const hasConflict = existingBookings.some((existingBookings) => {
      const existingStart = timeToMinutes(existingBookings.startTime);

      const existingEnd = existingStart + existingBookings.hours * 60;

      return bookingStart < existingEnd && bookingEnd > existingStart;
    });

    if (hasConflict) {
      return next(
        new AppError("The selected time slot is already booked.", 400),
      );
    }

    // Calculate pricing
    const hourlyRate = providerProfile.hourlyRate;
    const amount = hourlyRate * hours;

    // Create booking
    const booking = await Booking.create({
      customer: req.user._id,
      provider: providerId,
      providerProfile: providerProfile._id,
      category: categoryId,
      serviceDate,
      startTime,
      address,
      description,
      hours,
      hourlyRateAtBookingTime: hourlyRate,
      amount,
    });

    // Notify provider
    await createNotification({
      recipient: booking.provider,
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
      recipient: booking.provider,
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
