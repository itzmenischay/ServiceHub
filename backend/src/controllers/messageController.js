import mongoose from "mongoose";
import Message from "../models/Message.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import AppError from "../utils/AppError.js";
import { createNotification } from "../services/notificationService.js";

// Send Message
export const sendMessage = async (req, res, next) => {
  try {
    const { bookingId, receiverId, message } = req.body;

    // find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // sender must belong to booking
    const isCustomer = booking.customer.toString() === req.user._id.toString();

    const isProvider = booking.provider.toString() === req.user._id.toString();

    if (!isCustomer && !isProvider) {
      return next(
        new AppError("You are not authorized for this conversation", 403),
      );
    }

    // receiver must be the other participant
    let expectedReceiver;

    if (isCustomer) {
      expectedReceiver = booking.provider.toString();
    } else {
      expectedReceiver = booking.customer.toString();
    }

    if (receiverId !== expectedReceiver) {
      return next(new AppError("Invalid receiver", 400));
    }

    // create message
    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      booking: bookingId,
      message,
    });

    // populate sender info
    await newMessage.populate("sender", "name email");

    // Create notification
    await createNotification({
      recipient: receiverId,
      sender: req.user._id,
      type: "message",
      title: "New Message",
      message: `${req.user.name} sent you a message`,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

// Get Conversation
export const getConversation = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // only customer or provider can view conversation
    const isParticipant =
      booking.customer.toString() === req.user._id.toString() ||
      booking.provider.toString() === req.user._id.toString();

    if (!isParticipant) {
      return next(new AppError("Unauthorized access", 403));
    }

    const messages = await Message.find({
      booking: bookingId,
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// Mark Message As Read
export const markMessageAsRead = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // only participants can mark messages as read
    const isParticipant =
      booking.customer.toString() === req.user._id.toString() ||
      booking.provider.toString() === req.user.id.toString();

    if (!isParticipant) {
      return next(new AppError("Unauthorized access", 403));
    }

    await Message.updateMany(
      {
        booking: bookingId,
        receiver: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// Get User Status
export const getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select("name lastseen");

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

// Get Unread Message Count
export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// Get Chat List
export const getChatList = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const chats = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $group: {
          _id: "$booking",
          lastMessage: {
            $first: "$message",
          },
          lastMessageTime: {
            $first: "$createdAt",
          },
          sender: {
            $first: "$sender",
          },
          receiver: {
            $first: "$receiver",
          },
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "_id",
          as: "booking",
        },
      },
      {
        $unwind: "$booking",
      },
    ]);

    res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    next(error);
  }
};
