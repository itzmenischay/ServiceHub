import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      trim: true,
    },

    endTime: {
      type: String,
      required: [true, "End time is required"],
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const availabilitySchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    weeklySchedule: {
      monday: {
        type: [timeSlotSchema],
        default: [],
      },

      tuesday: {
        type: [timeSlotSchema],
        default: [],
      },

      wednesday: {
        type: [timeSlotSchema],
        default: [],
      },

      thursday: {
        type: [timeSlotSchema],
        default: [],
      },

      friday: {
        type: [timeSlotSchema],
        default: [],
      },

      saturday: {
        type: [timeSlotSchema],
        default: [],
      },

      sunday: {
        type: [timeSlotSchema],
        default: [],
      },
    },

    unavailableDates: [
      {
        type: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Availability", availabilitySchema);
