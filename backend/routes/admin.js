import express from "express";
import { 
  adminLogin, 
  getAdminStats, 
  getAllUsers, 
  updateUserStatus,
  deleteUser, 
  getAllSkills,
  deleteSkill,
  getAllSwaps,
  getAllReviews,
  deleteReview,
  broadcastAlert,
  getPlatformSettings,
  updatePlatformSettings,
  getAdminLogs
} from "../controllers/adminController.js";

import { adminProtect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);

// Apply protection to all subsequent routes
router.use(adminProtect);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.patch("/users/status", updateUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/skills", getAllSkills);
router.delete("/skills/:id", deleteSkill);
router.get("/swaps", getAllSwaps);
router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReview);
router.post("/broadcast", broadcastAlert);

// Professional Features: Settings & Logs
router.get("/settings", getPlatformSettings);
router.patch("/settings", updatePlatformSettings);
router.get("/logs", getAdminLogs);

export default router;
