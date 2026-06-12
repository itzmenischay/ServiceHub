import express from "express";
import {
  createProviderProfile,
  getMyProviderProfile,
  updateProviderProfile,
} from "../controllers/providerController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", protect, authorize("provider"), createProviderProfile);
router.get("/me", protect, authorize("provider"), getMyProviderProfile);
router.put("/", protect, authorize("provider"), updateProviderProfile);

export default router;
