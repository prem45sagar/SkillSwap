import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }
    req.user = user;
    
    // Update lastActive timestamp on each request (without triggering full save/validation)
    await User.findByIdAndUpdate(user._id, { lastActive: new Date() });
    
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

export const adminProtect = async (req, res, next) => {
  let token = req.cookies.adminToken;
  
  if (!token) {
    return res.status(401).json({ message: "Admin access unauthorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Access restricted to Administrators only" });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Admin session failed or expired" });
  }
};
