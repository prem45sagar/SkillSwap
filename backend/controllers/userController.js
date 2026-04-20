import User from "../models/User.js";
import Notification from "../models/Notification.js";
import SwapRequest from "../models/SwapRequest.js";
import Review from "../models/Review.js";
import Explore from "../models/Explore.js";
import mongoose from "mongoose";

export const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    if (id === currentUserId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    if (currentUser.following.includes(id)) {
      // Unfollow
      currentUser.following = currentUser.following.filter(uid => uid.toString() !== id);
      userToFollow.followers = userToFollow.followers.filter(uid => uid.toString() !== currentUserId.toString());
      await currentUser.save();
      await userToFollow.save();
      return res.json({ message: "Unfollowed successfully", isFollowing: false });
    } else {
      // Follow
      currentUser.following.push(id);
      userToFollow.followers.push(currentUserId);
      await currentUser.save();
      await userToFollow.save();

      // Create notification
      await Notification.create({
        recipient: id,
        sender: currentUserId,
        type: "follow",
        title: "New Follower",
        description: `${currentUser.name} started following you!`,
      });

      return res.json({ message: "Followed successfully", isFollowing: true });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Sync stats before returning profile to ensure accuracy
    const userId = id;
    const completedSwapsCount = await SwapRequest.countDocuments({
      $and: [
        { $or: [{ sender: userId }, { receiver: userId }] },
        { 
          $or: [
            { status: "completed" },
            { status: "accepted", senderReviewed: true, receiverReviewed: true }
          ]
        }
      ]
    });

    // Calculate total hours taught
    const completedSwaps = await SwapRequest.find({
      $and: [
        { $or: [{ sender: userId }, { receiver: userId }] },
        {
          $or: [
            { status: "completed" },
            { status: "accepted", senderReviewed: true, receiverReviewed: true }
          ]
        }
      ]
    }).populate("senderSkill receiverSkill");

    let totalMinutes = 0;
    completedSwaps.forEach(swap => {
      let skill;
      const sId = swap.sender._id || swap.sender;
      if (sId.toString() === userId.toString()) {
        skill = swap.senderSkill;
      } else {
        skill = swap.receiverSkill;
      }
      
      if (skill) {
        let duration = skill.duration || 0;
        // Default to at least 1 hour (60 mins) per session if duration is missing/zero
        if (duration === 0) duration = 60; 
        
        if (skill.durationUnit === 'days') {
          totalMinutes += duration * 24 * 60;
        } else {
          totalMinutes += duration;
        }
      } else {
        // Fallback: If skill was deleted but swap is completed, count as a standard 2-hour session
        totalMinutes += 120;
      }
    });

    const totalHours = Math.round(totalMinutes / 60);

    const reviews = await Review.find({ reviewee: userId });
    const numReviews = reviews.length;
    const totalRatingPoints = reviews.reduce((sum, r) => sum + r.rating, 0);
    const rating = numReviews > 0 ? (totalRatingPoints / numReviews).toFixed(1) : 0;

    // Calculate total endorsements and top skills
    const userSkills = await Explore.find({ owner: userId });
    const totalEndorsements = userSkills.reduce((sum, skill) => sum + (skill.endorsements?.length || 0), 0);
    
    let topSkills = userSkills
      .sort((a, b) => (b.endorsements?.length || 0) - (a.endorsements?.length || 0))
      .slice(0, 3)
      .map(s => ({
        name: s.name,
        count: s.endorsements?.length || 0
      }));

    if (topSkills.length === 0) {
      topSkills = (user.skills || []).slice(0, 3).map(name => ({ name, count: 0 }));
    }

    const finalUser = await User.findByIdAndUpdate(
      userId,
      { 
        completedSwaps: completedSwaps.length,
        numReviews,
        totalRatingPoints,
        rating,
        totalEndorsements,
        totalHours,
        topSkills
      },
      { returnDocument: 'after' }
    ).select("-password -passwordResetToken -passwordResetExpires");

    // Check if the current user is following this user
    const isFollowing = req.user ? finalUser.followers.includes(req.user._id) : false;
    
    res.json({ ...finalUser.toObject(), isFollowing });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(id).populate("followers", "name avatar bio title");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(id).populate("following", "name avatar bio title");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const syncStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Calculate total hours taught
    const completedSwaps = await SwapRequest.find({
      $and: [
        { $or: [{ sender: userId }, { receiver: userId }] },
        {
          $or: [
            { status: "completed" },
            { status: "accepted", senderReviewed: true, receiverReviewed: true }
          ]
        }
      ]
    }).populate("senderSkill receiverSkill");

    let totalMinutes = 0;
    completedSwaps.forEach(swap => {
      let skill;
      const sId = swap.sender._id || swap.sender;
      if (sId.toString() === userId.toString()) {
        skill = swap.senderSkill;
      } else {
        skill = swap.receiverSkill;
      }
      
      if (skill) {
        let duration = skill.duration || 0;
        if (duration === 0) duration = 60;
        
        if (skill.durationUnit === 'days') {
          totalMinutes += duration * 24 * 60;
        } else {
          totalMinutes += duration;
        }
      } else {
        totalMinutes += 120;
      }
    });

    const totalHours = Math.round(totalMinutes / 60);

    // Calculate rating stats from reviews received
    const reviews = await Review.find({ reviewee: userId });
    const numReviews = reviews.length;
    const totalRatingPoints = reviews.reduce((sum, r) => sum + r.rating, 0);
    const rating = numReviews > 0 ? (totalRatingPoints / numReviews).toFixed(1) : 0;

    // Calculate total endorsements and top skills
    const userSkills = await Explore.find({ owner: userId });
    const totalEndorsements = userSkills.reduce((sum, skill) => sum + (skill.endorsements?.length || 0), 0);
    
    let topSkills = userSkills
      .sort((a, b) => (b.endorsements?.length || 0) - (a.endorsements?.length || 0))
      .slice(0, 3)
      .map(s => ({
        name: s.name,
        count: s.endorsements?.length || 0
      }));

    if (topSkills.length === 0) {
      const u = await User.findById(userId);
      topSkills = (u.skills || []).slice(0, 3).map(name => ({ name, count: 0 }));
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        completedSwaps: completedSwaps.length,
        numReviews,
        totalRatingPoints,
        rating,
        totalEndorsements,
        totalHours,
        topSkills
      },
      { returnDocument: 'after' }
    );

    res.json({
      completedSwaps: updatedUser.completedSwaps,
      rating: updatedUser.rating,
      numReviews: updatedUser.numReviews,
      totalEndorsements: updatedUser.totalEndorsements,
      totalHours: updatedUser.totalHours,
      topSkills: updatedUser.topSkills
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
