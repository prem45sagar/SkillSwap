import express from "express";
import {
  createSkill,
  getSkills,
  getSkillById,
  deleteSkill,
  updateSkill,
  repostSkill,
  endorseSkill,
} from "../controllers/skillController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createSkill);
router.get("/", getSkills);
router.get("/:id", getSkillById);
router.put("/:id", protect, updateSkill);
router.delete("/:id", protect, deleteSkill);
router.post("/:id/repost", protect, repostSkill);
router.post("/:id/endorse", protect, endorseSkill);

export default router;
