import rateLimit from 'express-rate-limit';

// Generic rate limit settings
const baseOptions = {
	windowMs: 15 * 60 * 1000, // 15 minutes
	standardHeaders: true,
	legacyHeaders: false,
	message: 'Too many requests from this IP, please try again later.',
};

// 🛡️ Login: max 5 requests in 15 mins
export const loginLimiter = rateLimit({
	...baseOptions,
	max: 5,
	keyGenerator: (req) => req.body?.email || req.ip,
	message: 'Too many login attempts. Try again in 15 minutes.',
});

// 📩 Forgot Password: 3 per 15 mins
export const forgotPasswordLimiter = rateLimit({
	...baseOptions,
	max: 3,
	keyGenerator: (req) => req.body?.email || req.ip,
	message: 'You can only request password reset 3 times every 15 minutes.',
});

// 🔁 Resend Email Verification: 3 per hour
export const resendVerificationLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 3,
	keyGenerator: (req) => req.body?.email || req.ip,
	message: 'You can only request email verification 3 times per hour.',
});
