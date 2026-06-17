import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("admin"), getDashboardStats);

router.get("/dashboard/users", protect, authorize("admin"), getAllUsers);

router.get("/dashboard/users/:id", protect, authorize("admin"), getSingleUser);

router.put(
  "/dashboard/users/:id/role",
  protect,
  authorize("admin"),
  updateUserRole,
);

router.delete("/dashboard/users/:id", protect, authorize("admin"), deleteUser);

export default router;
