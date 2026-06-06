import express from "express";
import {
  createProviderProfile,
  getMyProviderProfile,
  updateProviderProfile,
} from "../controllers/providerController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", protect, createProviderProfile);
router.get("/me", protect, getMyProviderProfile);
router.put("/", protect, updateProviderProfile);

export default router;
