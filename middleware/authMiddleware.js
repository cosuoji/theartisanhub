import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Blacklist from "../models/Blacklist.js";

export const protectRoute = async (req, res, next) => {
  try {
    // 1️⃣ Get token
    const accessToken =
      req.cookies.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized - No access token provided" });
    }

    // 2️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Access token expired" });
      }
      return res.status(401).json({ message: "Invalid access token" });
    }

    // 3️⃣ Check if token was blacklisted (user logged out)
    const isBlacklisted = await Blacklist.findOne({ jti: decoded.jti });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token invalidated. Please log in again." });
    }

    // 4️⃣ Fetch user
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
