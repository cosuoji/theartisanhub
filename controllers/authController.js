import User from "../models/User.js";
import { redis } from "../utils/redis.js";
import jwt from "jsonwebtoken";
import { setCookies, storeRefreshToken, generateTokens } from "../utils/authHelpers.js";
import { sendResetEmail, sendVerificationEmail } from "../utils/sendEmails.js";
import { generateHashedToken } from "../utils/token.js";
import asyncHandler from "express-async-handler";
import crypto from 'crypto';
import Job from "../models/Job.js";
import Review from "../models/Review.js";
import { emailQueue } from "../jobs/index.js";




export const signup = async (req, res) => {
  try {
    const { password, name, role } = req.body;
    const email = req.body.email.toLowerCase();

      const { referrer } = req.body; // e.g. ?ref=ABC123
    
      if (referrer) {
        const referrerId = await redis.get(`referral_code:${referrer}`);
        if (referrerId) await recordReferral(referrerId, req.user._id);
      }
    
    // const {recaptchaToken} = req.body

  //     // 1a. Verify reCAPTCHA token with Google
  // const { data } = await axios.post(
  //   `https://www.google.com/recaptcha/api/siteverify`,
  //   null,
  //   {
  //     params: {
  //       secret: process.env.RECAPTCHA_SECRET_KEY,
  //       response: recaptchaToken,
  //     },
  //   }
  // );

  // if (!data.success || data.score < 0.5) {
  //   return res.status(400).json({ message: 'reCAPTCHA failed. Please try again.' });
  // }

    // 2) Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3) Create the user
    const user = await User.create({ email, password, role, name });

    // 4) Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    // 5) Email verification token
    const { rawToken, hashedToken, expires } = generateHashedToken();
    user.verificationToken = hashedToken;
    user.verificationTokenExpires = expires;
    await user.save();

    // 6) Attempt to send verification email (but don’t crash if it fails)
    try {
      //await sendVerificationEmail(user.email, rawToken);
      await emailQueue.add('verify', { type: 'verify', to: user.email, token: rawToken });
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
      // Optionally log/report email errors somewhere
    }

    // 7) Respond
    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
      message: 'Account created. Please check your email for verification.',
    });
  } catch (error) {
    console.error('Error in signup:', error.message);
    res.status(500).json({ message: 'Something went wrong during signup.' });
  }
};


export const login = asyncHandler(async (req, res) => {
	try {
	  const { password } = req.body;
    const email = req.body.email.toLowerCase();
    const rememberMe = req.body.rememberMe || false;

    
  //     // 1a. Verify reCAPTCHA token with Google
  // const { data } = await axios.post(
  //   `https://www.google.com/recaptcha/api/siteverify`,
  //   null,
  //   {
  //     params: {
  //       secret: process.env.RECAPTCHA_SECRET_KEY,
  //       response: recaptchaToken,
  //     },
  //   }
  // );

  // if (!data.success || data.score < 0.5) {
  //   return res.status(400).json({ message: 'reCAPTCHA failed. Please try again.' });
  // }

	
	  // 1. Validate input
	  if (!email || !password) {
		return res.status(400).json({ message: "Email and password are required" });
	  }
  
	  // 2. Find user
	  const user = await User.findOne({ email }).select('+password')
	  if (!user) {
		return res.status(401).json({ message: "User not found" });
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
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
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
			const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
			await redis.set(`bl_access:${decoded.jti}`, true, 'EX', 60 * 60); // 1 hour
		}
    
		if (refreshToken) {
			const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
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
    //await emailQueue.add('reset', { type: 'reset', to: user.email, token: rawToken });
    
  
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
      return res.status(400).json({ message: 'Token invalid or expired' });
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
      // Try finding a user who already verified (optional enhancement)
      const previouslyVerifiedUser = await User.findOne({
        isEmailVerified: true,
      });
  
      if (previouslyVerifiedUser) {
        return res.status(200).json({
          message: 'Your email is already verified. You can log in.',
          alreadyVerified: true,
        });
      }
  
      return res.status(400).json({ message: 'Verification link is invalid or has expired.' });
    }
  
    user.isEmailVerified = true;
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
  
      if (user.isEmailVerified) {
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
      const oldRefreshToken = req.cookies.refreshToken;
      if (!oldRefreshToken) throw new Error("No refresh token");
  
      // 1. Verify token
      const decoded = jwt.verify(oldRefreshToken, process.env.JWT_SECRET);
  
      // 2. Check Redis store
      const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
      if (storedToken !== oldRefreshToken) {
        throw new Error("Invalid refresh token");
      }
  
      // 3. Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
  
      // 4. Store new refresh token in Redis
      await redis.set(
        `refresh_token:${decoded.userId}`,
        newRefreshToken,
        "EX",
        30 * 24 * 60 * 60
      );
  
      // 5. Set new cookies
      setCookies(res, accessToken, newRefreshToken);
  
      // 6. Respond
      res.json({
        accessToken,
        refreshToken: newRefreshToken
      });
  
    } catch (error) {
      // Clear cookies to force logout on client
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.status(401).json({ message: error.message || "Unauthorized" });
    }
  });
  
  // controllers/authController.js
  export const changePassword = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;
  
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
  
    user.password = newPassword;
    await user.save();
  
    // ❌ Invalidate refresh token
    await redis.del(`refresh_token:${userId}`);
  
    // ❌ Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  
    return res.status(200).json({ message: 'Password changed. Please log in again.' });
  });
  


  // controller
export const getArtisanStats = asyncHandler(async (req, res) => {
 try {
   const userId = req.user._id;
 
   const [jobCount, reviews, user] = await Promise.all([
     Job.countDocuments({ artisan: userId, status: 'completed' }),
     Review.find({ artisan: userId }),
     User.findById(userId).select('artisanProfile.available'),
   ]);
    
   const avgRating = reviews.length
     ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
     : 0;
 
   res.json({
     totalJobs: jobCount,
     averageRating: avgRating,
     reviewCount: reviews.length,
     available: user.artisanProfile.available,
   });
 } catch (error) {
    res.status(401).json({ message: error.message || "Verify Your email" });
 }
});

