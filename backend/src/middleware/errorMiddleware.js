const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

export default errorMiddleware;
