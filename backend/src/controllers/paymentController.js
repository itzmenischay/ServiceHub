import crypto from "crypto";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import razorpay from "../config/razorpay.js";
import AppError from "../utils/AppError.js";
import { createNotification } from "../services/notificationService.js";

// Create Payment Order
export const createPaymentOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    // find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // booking must belong to customer
    if (booking.customer.toString() !== req.user._id.toString()) {
      return next(new AppError("Unauthorized", 403));
    }

    // prevent payment for already paid booking
    if (booking.paymentStatus === "paid") {
      return next(new AppError("Booking already paid", 400));
    }

    // check if a successful payment already exists
    const existingPayment = await Payment.findOne({
      booking: bookingId,
      status: "paid",
    });

    if (existingPayment) {
      return next(
        new AppError("Payment already completed for this booking", 400),
      );
    }

    // amount to charge
    const amount = booking.amount;

    // create Razorpay order
    const options = {
      amount: amount * 100, // Convert INR → paise
      currency: "INR",
      receipt: `booking_${booking._id}`,
    };

    const order = await razorpay.orders.create(options);

    // create payment document
    const payment = await Payment.create({
      booking: booking._id,
      customer: booking.customer,
      provider: booking.provider,
      amount,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      order,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// Verify Payment
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Generate expected signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Verify signature
    if (generatedSignature !== razorpay_signature) {
      return next(new AppError("Invalid payment signature", 400));
    }

    // Find payment
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return next(new AppError("Payment record not found", 404));
    }

    // Prevent duplicate verification
    if (payment.status === "paid") {
      return next(new AppError("Payment already verified", 400));
    }

    // Update payment document
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;

    await payment.save();

    // Update booking
    const booking = await Booking.findById(payment.booking);

    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    booking.paymentStatus = "paid";
    booking.paymentId = payment._id;

    await booking.save();

    await createNotification({
      recipient: payment.provider,
      sender: payment.customer,
      type: "payment",
      title: "Payment Received",
      message: `${payment.amount} payment received successfully.`,
    });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// Get Payment History
export const getPaymentHistory = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === "customer") {
      query.customer = req.user._id;
    } else if (req.user.role === "provider") {
      query.provider = req.user._id;
    }

    // admin gets all payments

    const payments = await Payment.find(query)
      .populate("booking")
      .populate("customer", "name email")
      .populate("provider", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// Refund Payment
export const refundPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    // find payment
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return next(new AppError("Payment not found", 404));
    }

    // only paid payments can be refunded
    if (payment.status !== "paid") {
      return next(new AppError("Only paid payments can be refunded", 400));
    }

    // initialize refund with Razorpay
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId);

    // update payment
    payment.status = "refunded";

    // update booking
    const booking = await Booking.findById(payment.booking);

    if (booking) {
      booking.paymentStatus = "refunded";

      await booking.save();
    }

    await createNotification({
      recipient: payment.customer,
      type: "payment",
      title: "Refund Processed",
      messaeg: "Your payment has been refunded.",
    });

    res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      refund,
      payment,
    });
  } catch (error) {
    next(error);
  }
};
