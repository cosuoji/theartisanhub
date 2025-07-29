import express from 'express';
import { adminRoute, protectRoute } from '../middleware/authMiddleware.js';
import { generateReferralCode, getReferralStats } from '../utils/referral.js';

const router = express.Router();

// GET /api/referral/code → returns user’s unique code
router.get('/code', protectRoute, async (req, res) => {
  const code = await generateReferralCode();
  res.json({ code });
});

// POST /api/referral/convert
router.post('/convert', protectRoute, async (req, res) => {
  const { code } = req.body; // code from URL or form
  const referrerId = await redis.get(`referral_code:${code}`);
  if (!referrerId) return res.status(400).json({ message: 'Invalid code' });

  await recordReferral(referrerId, req.user._id);
  res.json({ message: 'Referral recorded' });
});

// GET /api/referral/stats
router.get('/stats', protectRoute, async (req, res) => {
  const stats = await getReferralStats(req.user._id);
  res.json(stats);
});

// Admin route
router.get('/admin/stats', protectRoute, adminRoute, async (req, res) => {
  const keys = await redis.keys('referral_count:*');
  const counts = await Promise.all(keys.map(k => redis.get(k)));
  res.json(keys.map((k, i) => ({ userId: k.split(':')[1], count: Number(counts[i]) })));
});

export default router