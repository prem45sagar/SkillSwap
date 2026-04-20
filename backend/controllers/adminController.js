import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import SwapRequest from "../models/SwapRequest.js";
import Review from "../models/Review.js";
import Skill from "../models/Explore.js"; // This is the Explore model
import Notification from "../models/Notification.js";
import PlatformSettings from "../models/PlatformSettings.js";
import AdminLog from "../models/AdminLog.js";

const logAction = async (adminId, action, target = "", details = "") => {
  try {
    await AdminLog.create({ admin: adminId, action, target, details });
  } catch (err) {
    console.error("Logging failed:", err);
  }
};

export const generateAdminToken = (id) => {
  return jwt.sign({ id, isAdmin: true }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateAdminToken(admin._id.toString());
    res.cookie("adminToken", token, { httpOnly: true, secure: true, maxAge: 86400000 });
    await logAction(admin.email, "LOGIN", "System", "Admin logged into dashboard");
    res.json({ _id: admin._id, name: admin.name, email: admin.email, role: admin.role });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// --- Advanced Functionality: Platform Settings ---
export const getPlatformSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) settings = await PlatformSettings.create({});
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

export const updatePlatformSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    await logAction("ADMIN", "UPDATE_SETTINGS", "Platform", JSON.stringify(req.body));
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

// --- Advanced Functionality: System Activity Logs ---
export const getAdminLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find().sort({ timestamp: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};

// --- Core Moderation with Correct Field Mapping ---
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSwaps = await SwapRequest.countDocuments();
    const totalSkills = await Skill.countDocuments();
    const totalReviews = await Review.countDocuments();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [growthDataRaw, swapsDataRaw] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            users: { $sum: 1 }
          }
        }
      ]),
      SwapRequest.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            swaps: { $sum: 1 }
          }
        }
      ])
    ]);

    // Pad missing days with zero
    const growthData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const userMatch = growthDataRaw.find(item => item._id === dateStr);
      const swapMatch = swapsDataRaw.find(item => item._id === dateStr);
      growthData.push({
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        users: userMatch ? userMatch.users : 0,
        swaps: swapMatch ? swapMatch.swaps : 0,
        fullDate: dateStr
      });
    }

    res.json({ 
      totalUsers, 
      totalSwaps, 
      totalSkills, 
      totalReviews,
      growthData
    });
  } catch (error) {
    res.status(500).json({ message: "Stats failure" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

export const updateUserStatus = async (req, res) => {
  const { userId, isBlocked } = req.body;
  try {
    const user = await User.findByIdAndUpdate(userId, { isBlocked }, { new: true });
    await logAction("ADMIN", isBlocked ? "BLOCK_USER" : "UNBLOCK_USER", user.email);
    res.json({ message: isBlocked ? "User blocked" : "User unblocked", user });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) await logAction("ADMIN", "DELETE_USER", user.email, "Permanently removed identity");
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const getAllSkills = async (req, res) => {
  try {
    // Model 'Explore' uses 'owner' field NOT 'user'
    const skills = await Skill.find().populate("owner", "name email").sort({ createdAt: -1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (skill) await logAction("ADMIN", "DELETE_SKILL", skill.name, "Removed offensive/spam skill");
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: "Skill removed" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const getAllSwaps = async (req, res) => {
  try {
    // Explore model uses 'name' NOT 'title'
    const swaps = await SwapRequest.find()
      .populate("sender receiver", "name email")
      .populate("senderSkill receiverSkill", "name")
      .sort({ createdAt: -1 });
    res.json(swaps);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("reviewer reviewee", "name").sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Fetch failed" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (review) await logAction("ADMIN", "DELETE_REVIEW", `Review ID: ${review._id}`, "Redacted inappropriate feedback");
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review redacted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const broadcastAlert = async (req, res) => {
  const { message } = req.body;
  try {
    const users = await User.find().select("_id");
    const notifications = users.map(u => ({ recipient: u._id, type: "system", title: "Global Notice", description: message }));
    await Notification.insertMany(notifications);
    await logAction("ADMIN", "BROADCAST", "Global", message);
    res.json({ message: "Broadcast sent" });
  } catch (error) {
    res.status(500).json({ message: "Broadcast failed" });
  }
};
