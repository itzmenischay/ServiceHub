import express from "express";
import { getProviders } from "../controllers/marketplaceController.js";

const router = express.Router();

router.get("/", getProviders);

export default router;
