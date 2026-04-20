import SwapRequest from "../models/SwapRequest.js";
import Notification from "../models/Notification.js";
import Explore from "../models/Explore.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Review from "../models/Review.js";

export const createSwapRequest = async (req, res) => {
  const { receiverId, senderSkillId, receiverSkillId, message } = req.body;
  const senderId = req.user._id;

  try {
    // Check if either sender or receiver has an ongoing swap by looking at skill statuses
    const senderBusy = await Explore.findOne({ owner: senderId, status: "ongoing" });
    const receiverBusy = await Explore.findOne({ owner: receiverId, status: "ongoing" });

    if (senderBusy || receiverBusy) {
      return res.status(400).json({ 
        message: senderBusy 
          ? "You already have an ongoing swap. Complete it before starting a new one." 
          : "This user already has an ongoing swap and cannot accept new requests right now." 
      });
    }

    const swapRequest = await SwapRequest.create({
      sender: senderId,
      receiver: receiverId,
      senderSkill: senderSkillId,
      receiverSkill: receiverSkillId,
      message,
    });

    // Create Notification for receiver
    const sender = await User.findById(senderId);
    const receiverSkill = await Explore.findById(receiverSkillId);
    
    await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: "request",
      title: "New Swap Request",
      description: `${sender.name} wants to swap for your ${receiverSkill.name} skill.`,
      data: { requestId: swapRequest._id }
    });

    res.status(201).json(swapRequest);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getSwapRequests = async (req, res) => {
  const userId = req.user._id;

  try {
    const swapRequests = await SwapRequest.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email avatar lastActive")
      .populate("receiver", "name email avatar lastActive")
      .populate("senderSkill", "name description")
      .populate("receiverSkill", "name description");
    
    // Fetch reviews for these swap requests
    const swapIds = swapRequests.map(s => s._id);
    const reviews = await Review.find({ swapRequest: { $in: swapIds } });

    // Attach reviews to swap requests
    const mappedRequests = swapRequests.map(s => {
      const sObj = s.toObject();
      const sReviews = reviews.filter(r => r.swapRequest.toString() === s._id.toString());
      
      // The rating seen by the CURRENT user is the rating THEY GAVE or THEY RECEIVED?
      // Usually "Successful Completion" rating in history is the one RECEIVED from the partner.
      const ratingFromPartner = sReviews.find(r => r.reviewer.toString() !== userId.toString())?.rating || null;
      const commentFromPartner = sReviews.find(r => r.reviewer.toString() !== userId.toString())?.comment || null;
      
      return {
        ...sObj,
        partnerRating: ratingFromPartner,
        partnerComment: commentFromPartner,
        hasProvidedReview: sReviews.some(r => r.reviewer.toString() === userId.toString())
      };
    });

    res.json(mappedRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateSwapRequestStatus = async (req, res) => {
  const { status } = req.body;
  const userId = req.user._id;

  try {
    const swapRequest = await SwapRequest.findById(req.params.id);
    if (!swapRequest) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    const isReceiver = swapRequest.receiver.toString() === userId.toString();
    const isSender = swapRequest.sender.toString() === userId.toString();

    if (!isReceiver && !isSender) {
      return res.status(401).json({ message: "Not authorized to update this request" });
    }

    // Handle cancellation of an accepted swap (either party can cancel)
    if (status === "cancelled" && swapRequest.status === "accepted") {
      const cancellingUser = await User.findById(userId);
      const otherUserId = isSender ? swapRequest.receiver : swapRequest.sender;

      // Revert both skills back to 'open'
      if (swapRequest.receiverSkill) {
        await Explore.findByIdAndUpdate(swapRequest.receiverSkill, { status: "open" });
      }
      if (swapRequest.senderSkill) {
        await Explore.findByIdAndUpdate(swapRequest.senderSkill, { status: "open" });
      }

      // Notify the other user
      await Notification.create({
        recipient: otherUserId,
        sender: userId,
        type: "rejected",
        title: "Swap Cancelled",
        description: `${cancellingUser.name} has cancelled the accepted swap.`,
        data: { requestId: swapRequest._id }
      });

      // Update status to cancelled
      swapRequest.status = "cancelled";
      await swapRequest.save();

      return res.json({ message: "Accepted swap cancelled successfully", swapRequest });
    }

    // Handle Sender Cancellation of a pending request
    if (isSender && (status === "cancelled" || status === "rejected")) {
      // Remove the notification sent to the receiver
      await Notification.deleteMany({
        recipient: swapRequest.receiver,
        "data.requestId": swapRequest._id
      });
      // Delete the actual request
      await SwapRequest.findByIdAndDelete(req.params.id);
      return res.json({ message: "Request cancelled and removed successfully" });
    }

    // Handle Receiver Rejection/Acceptance
    if (isReceiver) {
      swapRequest.status = status;
      await swapRequest.save();

      // Create Notification for sender about status update
      const receiver = await User.findById(userId);
      
      await Notification.create({
        recipient: swapRequest.sender,
        sender: userId,
        type: status === "accepted" ? "accepted" : (status === "rejected" ? "rejected" : "system"),
        title: `Swap Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        description: `${receiver.name} has ${status} your swap request.`,
        data: { requestId: swapRequest._id }
      });

      // If accepted, create a system message in the chat and update skill statuses
      if (status === "accepted") {
        await Message.create({
          sender: userId, // Receiver of the request acts as sender of system msg
          receiver: swapRequest.sender,
          content: `${receiver.name} accepted the skill swap! You can now start chatting and learning.`,
          messageType: "system",
          swapRequest: swapRequest._id
        });

        // Update both skills to 'ongoing' and set startDate
        if (swapRequest.receiverSkill) {
          await Explore.findByIdAndUpdate(swapRequest.receiverSkill, { 
            status: "ongoing", 
            startDate: new Date() 
          });
        }
        if (swapRequest.senderSkill) {
          await Explore.findByIdAndUpdate(swapRequest.senderSkill, { 
            status: "ongoing", 
            startDate: new Date() 
          });
        }
      }

      return res.json(swapRequest);
    }

    res.status(400).json({ message: "Invalid action for your role" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
