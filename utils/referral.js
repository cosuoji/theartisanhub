// import { redis } from "./redis.js";
// import crypto from 'crypto';

// // 1. Generate 6-char code
// export const generateReferralCode = () =>
//   crypto.randomBytes(3).toString('hex').toUpperCase();

// // 2. Record conversion
// export const recordReferral = async (referrerId, refereeId) => {
//   const key = `referral:${referrerId}`;
//   await redis.sadd(key, refereeId);            // unique set
//   await redis.incr(`referral_count:${referrerId}`);
// };

// // 3. Stats for admin / user
// export const getReferralStats = async (userId) => ({
//   count: Number(await redis.get(`referral_count:${userId}`) || 0),
//   referees: await redis.smembers(`referral:${userId}`),
// });