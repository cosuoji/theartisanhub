// controllers/locationController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

/**
 * @desc    Get list of all unique artisan locations
 * @route   GET /api/locations
 * @access  Public
 */
export const getAllLocations = asyncHandler(async (req, res) => {
  const locations = await User.distinct('artisanProfile.location', {
    role: 'artisan',
    'artisanProfile.location': { $exists: true, $ne: '' },
    isDeleted: false,
  });

  const cleaned = locations
    .map((loc) => loc?.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  res.json(cleaned);
});
