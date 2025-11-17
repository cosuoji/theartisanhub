import express from 'express';
import { verifyBVN, verifyNIN } from '../controllers/kycController.js';

const router = express.Router();

// BVN verification
router.post('/bvn', verifyBVN);

// NIN verification
router.post('/nin', verifyNIN);

export default router;
