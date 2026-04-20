import express from "express";
import {
  createSwapRequest,
  getSwapRequests,
  updateSwapRequestStatus,
} from "../controllers/swapController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createSwapRequest);
router.get("/", protect, getSwapRequests);
router.patch("/:id", protect, updateSwapRequestStatus);

export default router;
