import jwt from 'jsonwebtoken';
import { redis } from './redis.js';
import { v4 as uuidv4 } from 'uuid';

export const generateTokens = (userId) => {
  const jti = uuidv4();

  const accessToken = jwt.sign({ userId, jti }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  const refreshToken = jwt.sign({ userId, jti }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  return { accessToken, refreshToken, jti };
};

export const storeRefreshToken = async (userId, refreshToken) => {
  try {
    await redis.set(`refresh_token:${userId}`, refreshToken, 'EX', 30 * 24 * 60 * 60); // 30 days
  } catch (err) {
    console.error('❌ Failed to store refresh token in Redis:', err.message);
  }
};

export const setCookies = (res, accessToken, refreshToken, rememberMe = false) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const cookieOptions = {
    httpOnly: true,
    secure: isProduction, // Must be true in production for SameSite=None
    sameSite: isProduction ? 'None' : 'Lax', // None only works with Secure
    path: '/',
    domain: isProduction ? '.yourdomain.com' : undefined, // Leading dot for subdomains
  };

  // Access Token (shorter lifespan)
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
  });

  // Refresh Token
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });

  // Additional header for mobile clients
  res.set('X-Auth-Strategy', 'cookies');
};