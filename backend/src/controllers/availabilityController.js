import AppError from "../utils/AppError.js";
import Availability from "../models/Availability.js";

// Validate Schedule
const validateSchedule = (weeklySchedule) => {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  for (const day of days) {
    const slots = weeklySchedule?.[day] || [];

    for (const slot of slots) {
      if (!slot.startTime || !slot.endTime) {
        throw new AppError(`${day}: startTime and endTime are required`, 400);
      }

      if (slot.startTime >= slot.endTime) {
        throw new AppError(`${day}: startTime must be before endTime`, 400);
      }
    }
  }
};

// Create or Update Availability
export const createOrUpdateAvailability = async (req, res, next) => {
  try {
    const { weeklySchedule } = req.body || {};

    validateSchedule(weeklySchedule);

    let availability = await Availability.findOne({
      provider: req.user._id,
    });

    if (availability) {
      availability.weeklySchedule = weeklySchedule;

      await availability.save();
    } else {
      availability = await Availability.create({
        provider: req.user._id,
        weeklySchedule,
      });
    }

    res.status(200).json({
      success: true,
      availability,
    });
  } catch (error) {
    next(error);
  }
};

// Get My Availability
export const getMyAvailability = async (req, res, next) => {
  try {
    const availability = await Availability.findOne({
      provider: req.user._id,
    });

    if (!availability) {
      return next(new AppError("Availability not found", 404));
    }

    res.status(200).json({
      success: true,
      availability,
    });
  } catch (error) {
    next(error);
  }
};

// Get Provider Availability
export const getProviderAvailability = async (req, res, next) => {
  try {
    const availability = await Availability.findOne({
      provider: req.params.providerId,
    });

    if (!availability) {
      return next(new AppError("Availability not found", 404));
    }

    res.status(200).json({
      success: true,
      availability,
    });
  } catch (error) {
    next(error);
  }
};

// Add Unavailable Date
export const addUnavailableDate = async (req, res, next) => {
  try {
    const { date } = req.body || {};

    if (!date) {
      return next(new AppError("Date is required", 400));
    }

    const availability = await Availability.findOne({
      provider: req.user._id,
    });

    if (!availability) {
      return next(new AppError("Availability not found", 404));
    }

    const exists = availability.unavailableDates.some(
      (unavailableDate) => unavailableDate.toISOString().split("T")[0] === date,
    );

    if (exists) {
      return next(new AppError("Date already marked unavailable", 400));
    }

    availability.unavailableDates.push(new Date(date));

    await availability.save();

    res.status(200).json({
      success: true,
      message: "Unavailable date added successfully",
      unavailableDates: availability.unavailableDates,
    });
  } catch (error) {
    next(error);
  }
};

// Remove Unavailable Dates
export const removeUnavailableDate = async (req, res, next) => {
  try {
    const { date } = req.body || {};

    if (!date) {
      return next(new AppError("Date is required", 400));
    }

    const availability = await Availability.findOne({
      provider: req.user._id,
    });

    if (!availability) {
      return next(new AppError("Availability not found", 404));
    }

    availability.unavailableDates = availability.unavailableDates.filter(
      (unavailableDate) => unavailableDate.toISOString().split("T")[0] !== date,
    );

    await availability.save();

    res.status(200).json({
      success: true,
      message: "Unavailable date removed successfully",
      unavailableDates: availability.unavailableDates,
    });
  } catch (error) {
    next(error);
  }
};
