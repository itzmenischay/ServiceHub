import AppError from "../utils/AppError.js";

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user.role}' is not authorized to access this resource`,
          403,
        ),
      );
    }

    next();
  };
};

export default authorizeRoles;
