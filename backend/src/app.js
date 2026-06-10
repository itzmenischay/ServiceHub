import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import AppError from "./utils/AppError.js";
import providerRoutes from "./routes/providerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

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

app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/categories", categoryRoutes);

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
