import Review from "../models/Review.js";
import User from "../models/User.js";
import SwapRequest from "../models/SwapRequest.js";
import Explore from "../models/Explore.js";
import Message from "../models/Message.js";

export const createReview = async (req, res) => {
  try {
    const { revieweeId, skillId, rating, comment, requestId } = req.body;
    const reviewerId = req.user._id;

    // Create the review
    const review = await Review.create({
      reviewer: reviewerId,
      reviewee: revieweeId,
      skill: skillId,
      rating,
      comment,
      swapRequest: requestId
    });

    // Update the reviewee's stats
    const reviewee = await User.findById(revieweeId);
    if (reviewee) {
      const newTotalPoints = (reviewee.totalRatingPoints || 0) + rating;
      const newNumReviews = (reviewee.numReviews || 0) + 1;
      const newRating = (newTotalPoints / newNumReviews).toFixed(1);

      await User.findByIdAndUpdate(revieweeId, {
        totalRatingPoints: newTotalPoints,
        numReviews: newNumReviews,
        rating: newRating
      });
    }

    // Update SwapRequest review flags
    if (requestId) {
      const swap = await SwapRequest.findById(requestId);
      if (swap) {
        let skillToCompleteId = null;
        if (swap.sender.toString() === reviewerId.toString()) {
          swap.senderReviewed = true;
          skillToCompleteId = swap.senderSkill;
        } else if (swap.receiver.toString() === reviewerId.toString()) {
          swap.receiverReviewed = true;
          skillToCompleteId = swap.receiverSkill;
        }
        await swap.save();

        // Mark the reviewer's taught skill as completed
        if (skillToCompleteId) {
          await Explore.findByIdAndUpdate(skillToCompleteId, { status: "completed" });
        }

        // If both reviewed, mark the swap as fully completed and update user stats
        if (swap.senderReviewed && swap.receiverReviewed) {
          const skill = await Explore.findById(skillId);
          const reviewer = await User.findById(reviewerId);

          // Mark swap status as completed
          swap.status = "completed";
          await swap.save();

          // Increment completedSwaps for both users
          await User.findByIdAndUpdate(swap.sender, { $inc: { completedSwaps: 1 } });
          await User.findByIdAndUpdate(swap.receiver, { $inc: { completedSwaps: 1 } });
          
          await Message.create({
            sender: reviewerId,
            receiver: revieweeId,
            content: `The skill swap for "${skill?.name}" is now officially successful! Both users have verified the exchange with their reviews.`,
            messageType: "system",
            swapRequest: requestId
          });
        }
      }
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewee: userId })
      .populate("reviewer", "name avatar title")
      .populate("skill", "name")
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
