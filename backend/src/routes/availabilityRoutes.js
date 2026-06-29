import express from "express";
import {
  createOrUpdateAvailability,
  getMyAvailability,
  getProviderAvailability,
  addUnavailableDate,
  removeUnavailableDate,
} from "../controllers/availabilityController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/", protect, authorize("provider"), createOrUpdateAvailability);
router.get("/me", protect, authorize("provider"), getMyAvailability);

router.get("/provider/:providerId", getProviderAvailability);

// router
//   .route("/unavailable-date")
//   .post(protect, authorize("provider"), addUnavailableDate)
//   .delete(protect, authorize("provider"), removeUnavailableDate);

router.post("/unavailable-date", protect, authorize("provider"), addUnavailableDate)
router.delete("/unavailable-date", protect, authorize("provider"), removeUnavailableDate)


export default router;
