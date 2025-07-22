import mongoose from 'mongoose';
import { redis } from '../utils/redis.js';
import logger from '../utils/logger.js';

export const healthCheck = async (req, res) => {
  try {
    // 1. MongoDB
    await mongoose.connection.db.admin().ping();

    // 2. Redis
    await redis.ping();

    res.status(200).json({ status: 'ok', services: ['mongo', 'redis'] });
  } catch (err) {
    logger.error('Health-check failed', { error: err.message });
    res.status(503).json({ status: 'error', services: err.message });
  }
};