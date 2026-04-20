import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import SwapRequest from "../models/SwapRequest.js";
import Explore from "../models/Explore.js";

export const getMessages = async (req, res) => {
  try {
    const { contactId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: contactId },
        { sender: contactId, receiver: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const createMessage = async (req, res) => {
  try {
    const { receiver, content, swapRequest, messageType, fileUrl, fileName } = req.body;
    const message = await Message.create({
      sender: req.user._id,
      receiver,
      content,
      swapRequest,
      messageType: messageType || "text",
      fileUrl,
      fileName
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const uploadFile = async (req, res) => {
  try {
    console.log(`[UPLOAD] Received request: ${req.file ? req.file.originalname : "No File"}`);
    if (!req.file) {
      console.log("[UPLOAD] No file found in request object");
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log(`[UPLOAD] File saved at: ${fileUrl}`);
    res.json({
      fileUrl,
      fileName: req.file.originalname,
      messageType: req.file.mimetype.startsWith("image/") ? "image" : "document"
    });
  } catch (error) {
    console.error("[UPLOAD] Error handling upload:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getContacts = async (req, res) => {
  try {
    // Basic implementation: anyone you have messaged with becomes a contact
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .populate("sender", "name avatar bio lastActive")
      .populate("receiver", "name avatar bio lastActive");

    const contactsMap = new Map();
    messages.forEach((msg) => {
      const other = msg.sender._id.equals(req.user._id) ? msg.receiver : msg.sender;
      if (!contactsMap.has(other._id.toString())) {
         contactsMap.set(other._id.toString(), other.toObject ? other.toObject() : other);
      }
    });

    const contactsArray = Array.from(contactsMap.values());
    
    // Add swapStatus for each contact
    for (const contact of contactsArray) {
       const swap = await SwapRequest.findOne({
          $or: [
            { sender: req.user._id, receiver: contact._id },
            { sender: contact._id, receiver: req.user._id }
          ]
       }).sort({ createdAt: -1 });

       if (swap && swap.status === "accepted") {
          // Check if the swap is truly active by looking at skill statuses
          const rSkill = await Explore.findById(swap.receiverSkill);
          const sSkill = await Explore.findById(swap.senderSkill);
          
          const isTrulyOngoing = (rSkill && rSkill.status === "ongoing") || (sSkill && sSkill.status === "ongoing");
          contact.swapStatus = isTrulyOngoing ? "accepted" : "completed";
       } else if (swap) {
          contact.swapStatus = swap.status;
       } else {
          contact.swapStatus = "none";
       }
    }
    
    res.json(contactsArray);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[DELETE] Request to delete message: ${id} by user: ${req.user._id}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid message ID format" });
    }

    const message = await Message.findById(id);
    if (!message) {
      console.log(`[DELETE] Message ${id} not found in database`);
      return res.status(404).json({ message: "Message not found in database" });
    }

    // Allow either the sender or the receiver to delete the message
    const isSender = message.sender.toString() === req.user._id.toString();
    const isReceiver = message.receiver.toString() === req.user._id.toString();

    if (!isSender && !isReceiver) {
      console.log(`[DELETE] User ${req.user._id} not authorized to delete message ${id}`);
      return res.status(401).json({ message: "You are not authorized to delete this message" });
    }

    await Message.findByIdAndDelete(id);
    console.log(`[DELETE] Message ${id} deleted successfully`);
    res.json({ message: "Message removed successfully" });
  } catch (error) {
    console.error("[DELETE] Critical Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
