import express from "express";
import { followUser, getUserProfile, getFollowers, getFollowing, syncStats } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile/sync", protect, syncStats);
router.get("/:id", protect, getUserProfile);
router.post("/:id/follow", protect, followUser);
router.get("/:id/followers", protect, getFollowers);
router.get("/:id/following", protect, getFollowing);

export default router;
