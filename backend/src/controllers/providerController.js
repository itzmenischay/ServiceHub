import ProviderProfile from "../models/ProviderProfile.js";
import AppError from "../utils/AppError.js";

// Create Provider Profile
export const createProviderProfile = async (req, res, next) => {
  try {
    const existingProfile = await ProviderProfile.findOne({
      user: req.user._id,
    });

    if (existingProfile) {
      return next(new AppError("Provider profile already exists", 409));
    }

    const provider = await ProviderProfile.create({
      user: req.user._id,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      message: "Provider profile created successfully",
      data: provider,
    });
  } catch (error) {
    next(error);
  }
};

// Get My Provider Profile
export const getMyProviderProfile = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({
      user: req.user._id,
    }).populate("user", "user email role");

    if (!profile) {
      return next(new AppError("Provider profile not found", 404));
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

// Update Provider Profile
export const updateProviderProfile = async (req, res, next) => {
  try {
    const profile = await ProviderProfile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      return next(new AppError("Provider profile not found", 404));
    }

    Object.assign(profile, req.body);

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
