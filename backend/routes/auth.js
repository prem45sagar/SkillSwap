import express from "express";
import {
  signup,
  login,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  getMe,
  logout,
  updateProfile,
  changePassword,
  deleteAccount,
  generateToken
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { body, validationResult } from "express-validator";
import passport from "passport";

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  "/signup",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("name").notEmpty().withMessage("Name is required"),
  ],
  validate,
  signup
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

// Google OAuth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback", 
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        console.error("Passport Auth Error:", err);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_error`);
      }
      if (!user) {
        console.error("No User found/created in Google Callback:", info);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=no_user`);
      }

      if (user.isBlocked) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=blocked`);
      }

      // Generate JWT
      const token = generateToken(user._id.toString());
      console.log("Generated JWT Token for user:", user.email);
      
      // Set Cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax', // Use 'none' for cross-domain prod, 'lax' for dev
        maxAge: 30 * 24 * 60 * 60 * 1000, 
      });

      console.log("Cookie set, redirecting to dashboard...");
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`);
    })(req, res, next);
  }
);

router.get("/me", protect, getMe);
router.post("/logout", logout);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.delete("/delete-account", protect, deleteAccount);
router.get("/verify-email", verifyEmail);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
