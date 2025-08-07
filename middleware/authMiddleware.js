import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { redis } from "../utils/redis.js"; // Make sure this is correctly imported

// src/middleware/protectRoute.js
export const protectRoute = async (req, res, next) => {
  try {
    // 1. Cookie first, then Authorization header
    const accessToken =
      req.cookies.accessToken ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized - No access token provided" });
    }

    // 2. Verify it
    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Access token expired" });
      }
      return res.status(401).json({ message: "Invalid access token" });
    }

    // 3. Black-list check
    const isBlacklisted = await redis.get(`bl_access:${decoded.jti}`);
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token has been blacklisted. Please log in again." });
    }

    // 4. Fetch user
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Access denied. Account is banned." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const adminRoute = (req, res, next) => {
  if (req.user?.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied - Admin only" });
};

export const emailVerified = (req, res, next) => {
  if (req.user?.isEmailVerified) {
    return next();
  }
  return res.status(403).json({
    message: "Please verify your email to access this feature.",
  });
};

export const artisanOnly = (req, res, next) => {
  if (req.user?.role === "artisan") {
    return next();
  }
  return res.status(403).json({ message: "Only artisans can perform this action." });
};
