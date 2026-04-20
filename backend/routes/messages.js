import express from "express";
import upload from "../utils/upload.js";
import { 
  getMessages, 
  createMessage, 
  getContacts,
  uploadFile,
  deleteMessage
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.delete("/delete/:id", protect, deleteMessage);
router.get("/contacts", protect, getContacts);
router.get("/:contactId", protect, getMessages);
router.post("/", protect, createMessage);
router.post("/upload", protect, upload.single("file"), uploadFile);

export default router;
