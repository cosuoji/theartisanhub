import User from "../models/User.js";
import { redis } from "../utils/redis.js";
import jwt from "jsonwebtoken";
import { validateSignupInput } from "../utils/validate.js";
import { setCookies, storeRefreshToken, generateTokens } from "../utils/authHelpers.js";
import { sendResetEmail, sendVerificationEmail } from "../utils/sendEmails.js";
import { generateHashedToken } from "../utils/token.js";
import asyncHandler from "express-async-handler";
import crypto from 'crypto';




export const signup = async (req, res) => {
    const { password } = req.body;
    const email = req.body.email.toLowerCase();

    try {
      // 1) Validate input
      const { isValid, errors } = validateSignupInput({ email, password });
      if (!isValid) {
        return res.status(400).json({ message: errors.join(' ') });
      }
  
      // 2) Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // 3) Create user
      const user = await User.create({ email, password });
  
      // 4) Generate tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);
  
      // 5) Generate & store email verification token
      const { rawToken, hashedToken, expires } = generateHashedToken();
      user.verificationToken = hashedToken;
      user.verificationTokenExpires = expires;
      await user.save();
  
      // 6) Send verification email
      await sendVerificationEmail(user.email, rawToken);
  
      // 7) Respond
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        message: 'Account created. Please verify your email.'
      });
  
    } catch (error) {
      console.error("Error in signup:", error.message);
      res.status(500).json({ message: error.message });
    }
  };

export const login = asyncHandler(async (req, res) => {
	try {
	  const { password } = req.body;
    const email = req.body.email.toLowerCase();

    const rememberMe = req.body.rememberMe || false;

	  
	  // 1. Validate input
	  if (!email || !password) {
		return res.status(400).json({ message: "Email and password are required" });
	  }
  
	  // 2. Find user
	  const user = await User.findOne({ email }).select('+password').populate('cart wishlist');;
	  if (!user) {
		return res.status(401).json({ message: "Invalid credentials" });
	  }
  
	  // 3. Verify password
	  const isMatch = await user.comparePassword(password);
	  if (!isMatch) {
		return res.status(401).json({ message: "Invalid credentials" });
	  }

    if (user.isBanned) {
      return res.status(403).json({ message: 'Your account has been banned' });
    }
  
	  
	  // 4. Generate tokens
    const { accessToken, refreshToken, jti } = generateTokens(user._id, rememberMe);
	  
	  // 5. Store refresh token
	  await storeRefreshToken(user._id, refreshToken);
	  
	  // 6. Set cookies
    setCookies(res, accessToken, refreshToken, rememberMe);
  
	  // 7. Return user data (without password)
	  res.json({
		_id: user._id,
		email: user.email,
		role: user.role,
	  });
  
	} catch (error) {
	  console.error("Login error:", error);
	  res.status(500).json({ message: "Internal server error" });
	}
  });

export const logout = asyncHandler(async (req, res) => {
	try {
    const accessToken = req.cookies.accessToken;
		const refreshToken = req.cookies.refreshToken;

    if (accessToken) {
			const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
			await redis.set(`bl_access:${decoded.jti}`, true, 'EX', 60 * 60); // 1 hour
		}
    
		if (refreshToken) {
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			await redis.del(`refresh_token:${decoded.userId}`);
		}

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});




export const getFullProfile = asyncHandler(async (req, res) => {
try {
		const user = await User.findById(req.user._id)
		  .select('-password -refreshTokens')
		  .lean();
	  
		res.json(user);
} catch (error) {
	res.status(500).json({ message: "Server error", error: error.message });
}
  });
  
  export const forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." }); // secure response
    }
  
    const { rawToken, hashedToken, expires } = generateHashedToken();
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expires;
    await user.save();
  
    await sendResetEmail(user.email, rawToken);
  
    res.status(200).json({ message: "If that email exists, a reset link has been sent." });
  };
  // 2) User resets password

  export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
  
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
  
    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }
  
    user.password = password; // hashed in pre-save
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  
    res.json({ message: "Password has been reset successfully." });
  };

  export const verifyEmail = async (req, res) => {
    const { token } = req.params;
  
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });
  
    if (!user) {
      return res.status(400).json({ message: 'Verification link is invalid or has expired.' });
    }
  
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
  
    res.json({ message: 'Email verified successfully. You can now log in.' });
  };

  export const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ message: 'No account found with that email.' });
      }
  
      if (user.isVerified) {
        return res.status(400).json({ message: 'This account is already verified.' });
      }
  
      // Generate new token
      const { rawToken, hashedToken, expires } = generateHashedToken();
      user.verificationToken = hashedToken;
      user.verificationTokenExpires = expires;
      await user.save();
  
      // Send email
      await sendVerificationEmail(user.email, rawToken);
  
      res.json({ message: 'Verification email resent.' });
  
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: 'Failed to resend verification email.' });
    }
  };

  export const refreshToken = asyncHandler(async (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) throw new Error("No refresh token");
    
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
    
      if (storedToken !== refreshToken) {
      throw new Error("Invalid refresh token");
      }
    
      // Generate new tokens
      const { accessToken, newRefreshToken } = generateTokens(decoded.userId);
      
      // Update Redis storage (with new TTL)
      await redis.set(
      `refresh_token:${decoded.userId}`,
      newRefreshToken,
      "EX", 
      30 * 24 * 60 * 60 // 30 days
      );
    
      // Set new cookies
      setCookies(res, accessToken, newRefreshToken);
    
      res.json({ 
      accessToken, 
      refreshToken: newRefreshToken 
      });
    } catch (error) {
      // Clear invalid tokens
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(401).json({ message: error.message });
    }
    });
  