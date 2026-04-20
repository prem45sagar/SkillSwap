import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/email.js";

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

import PlatformSettings from "../models/PlatformSettings.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if registration is enabled
    const settings = await PlatformSettings.findOne();
    if (settings && !settings.allowNewRegistrations) {
      return res.status(403).json({ message: "Registration is currently disabled by Admin." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: process.env.NODE_ENV !== "production",
    });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (err) {
      console.warn(
        `Email verification failed to send to ${email}, please use this link: http://localhost:3000/verify-email?token=${verificationToken}`,
      );
      console.error("Email error details:", err);
    }

    res.status(201).json({
      message:
        process.env.NODE_ENV !== "production"
          ? "User registered successfully. Status: Auto-verified (Development Mode)."
          : "User registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "User blocked by Admin." });
    }

    if (!user.isVerified) {
      return res
        .status(401)
        .json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id.toString());

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      avatar3d: user.avatar3d,
      avatarMode: user.avatarMode,
      skills: user.skills,
      title: user.title,
      settings: user.settings,
      links: user.links,
      skillswapId: user.skillswapId,
      country: user.country,
      education: user.education,
      experience: user.experience,
      achievements: user.achievements,
      platforms: user.platforms,
      followers: user.followers,
      following: user.following,
      rating: user.rating,
      numReviews: user.numReviews,
      completedSwaps: user.completedSwaps,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: "Password reset link sent to your email." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Update lastActive when user accesses their data (effectively "opens website/app")
    await User.findByIdAndUpdate(user._id, { lastActive: new Date() });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      avatar3d: user.avatar3d,
      avatarMode: user.avatarMode,
      skills: user.skills,
      title: user.title,
      settings: user.settings,
      links: user.links,
      skillswapId: user.skillswapId,
      country: user.country,
      education: user.education,
      experience: user.experience,
      achievements: user.achievements,
      platforms: user.platforms,
      followers: user.followers,
      following: user.following,
      rating: user.rating,
      numReviews: user.numReviews,
      completedSwaps: user.completedSwaps,
      totalHours: user.totalHours,
      topSkills: user.topSkills,
      totalEndorsements: user.totalEndorsements,
      isVerified: user.isVerified,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const logout = async (_req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: "Logged out successfully" });
};
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, bio, avatar, skills, title, avatar3d, avatarMode } = req.body;

    // Build update object explicitly to ensure all fields are captured
    const updateFields = {};
    if (name) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (avatar !== undefined) updateFields.avatar = avatar; // 2D Image Base64
    if (skills !== undefined) {
      // Sanitize: filter out any strings that look like MongoDB ObjectIds (24 hex characters)
      // to ensure only human-readable skill names are stored in the profile.
      updateFields.skills = Array.isArray(skills)
        ? skills.filter(skill => typeof skill === 'string' && !/^[0-9a-fA-F]{24}$/.test(skill))
        : skills;
    }
    if (title !== undefined) updateFields.title = title;
    if (avatar3d !== undefined) updateFields.avatar3d = avatar3d; // 3D Object
    if (avatarMode !== undefined) updateFields.avatarMode = avatarMode;
    if (req.body.settings !== undefined) updateFields.settings = req.body.settings;
    if (req.body.links !== undefined) updateFields.links = req.body.links;
    if (req.body.skillswapId !== undefined) updateFields.skillswapId = req.body.skillswapId;
    if (req.body.country !== undefined) updateFields.country = req.body.country;
    if (req.body.education !== undefined) updateFields.education = req.body.education;
    if (req.body.experience !== undefined) updateFields.experience = req.body.experience;
    if (req.body.achievements !== undefined) updateFields.achievements = req.body.achievements;
    if (req.body.platforms !== undefined) updateFields.platforms = req.body.platforms;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      avatar3d: updatedUser.avatar3d,
      avatarMode: updatedUser.avatarMode,
      skills: updatedUser.skills,
      title: updatedUser.title,
      settings: updatedUser.settings,
      links: updatedUser.links,
      skillswapId: updatedUser.skillswapId,
      country: updatedUser.country,
      education: updatedUser.education,
      experience: updatedUser.experience,
      achievements: updatedUser.achievements,
      platforms: updatedUser.platforms,
      followers: updatedUser.followers,
      following: updatedUser.following,
      rating: updatedUser.rating,
      numReviews: updatedUser.numReviews,
      completedSwaps: updatedUser.completedSwaps,
      totalHours: updatedUser.totalHours,
      topSkills: updatedUser.topSkills,
      totalEndorsements: updatedUser.totalEndorsements,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
