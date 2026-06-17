import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import AppError from "./utils/AppError.js";
import providerRoutes from "./routes/providerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import marketplaceRoutes from "./routes/marketplaceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import earningRoutes from "./routes/earningRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// Authentication Routes
app.use("/api/auth", authRoutes);

// Provider Routes
app.use("/api/providers", providerRoutes);

// Category Routes
app.use("/api/categories", categoryRoutes);

// Marketplace Routes
app.use("/api/marketplace", marketplaceRoutes);

// Booking Routes
app.use("/api/bookings", bookingRoutes);

// Review Routes
app.use("/api/reviews", reviewRoutes);

// Message Routes
app.use("/api/messages", messageRoutes);

// Payment Routes
app.use("/api/payments", paymentRoutes);

// Earning Routes
app.use("/api/earnings", earningRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

// 404 handler
app.all("/*splat", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global error middleware
app.use(errorMiddleware);

app.get("/", (req, res) => {
  res.send("ServiceHub API running...");
});

export default app;
