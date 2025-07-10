import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import { geocodeLocation } from '../utils/geocode.js';
import Review from '../models/Review.js';

// Get public list of artisans
export const getArtisanDirectory = asyncHandler(async (req, res) => {
    const { skill, location, category, page = 1, limit = 20 } = req.query;
    const filter = { role: 'artisan' };

    if (req.query.available) {
        filter['artisanProfile.available'] = req.query.available === 'true';
      }
      
      if (req.query.minRating) {
        filter['rating'] = { $gte: Number(req.query.minRating) };
      }
  
    if (location) filter['artisanProfile.location'] = new RegExp(location, 'i');
    if (category) filter['artisanProfile.category'] = new RegExp(category, 'i');
    if (skill) filter['artisanProfile.skills'] = { $in: [new RegExp(skill, 'i')] };
  
    const skip = (page - 1) * limit;


  
    const [artisans, total] = await Promise.all([
      User.find(filter)
        .select('email avatar artisanProfile')
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);
  
    res.json({
      artisans,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      reviews,
    });
  });
  
// Get single artisan public profile
export const getArtisanById = asyncHandler(async (req, res) => {
  const artisan = await User.findOne({ _id: req.params.id, role: 'artisan' }).select('-password');
  if (!artisan) return res.status(404).json({ message: 'Artisan not found' });
  res.json(artisan);
});

// Update own artisan profile
export const updateArtisanProfile = asyncHandler(async (req, res) => {
  const updates = req.body;
  const user = await User.findById(req.user._id);

  if (!user || user.role !== 'artisan') {
    return res.status(403).json({ message: 'Only artisans can update profile.' });
  }

  // ✅ Update top-level fields
  const topLevelFields = ['name', 'avatar', 'phone'];
  topLevelFields.forEach((field) => {
    if (updates[field] !== undefined) {
      user[field] = updates[field];
    }
  });

  // ✅ Validate phone
  if (updates.phone && !/^0\d{10}$/.test(updates.phone)) {
    return res.status(400).json({ message: 'Phone number must be 11 digits and start with 0' });
  }

  // ✅ Create artisanProfile if not present
  if (!user.artisanProfile) user.artisanProfile = {};

  // ✅ Update artisanProfile fields
  const profileFields = [
    'bio',
    'category',
    'skills',
    'yearsOfExperience',
    'location',
    'available',
  ];

  profileFields.forEach((field) => {
    if (updates[field] !== undefined) {
      user.artisanProfile[field] = updates[field];
    }
  });

  // ✅ Validate skill count
  if (updates.skills && updates.skills.length > 5) {
    return res.status(400).json({ message: 'You can only list up to 5 skills.' });
  }

  // ✅ Geocode if location was updated
  if (updates.location) {
    try {
      const coords = await geocodeLocation(updates.location);
      if (coords) {
        user.artisanProfile.coordinates = {
          type: 'Point',
          coordinates: coords,
        };
      } else {
        console.warn('Geocoding failed: No coordinates returned for location');
      }
    } catch (err) {
      console.error('Error during geocoding:', err.message);
      // Optional: return an error or just warn
      // return res.status(500).json({ message: 'Error geocoding location' });
    }
  }

  await user.save();
  res.json(user);
});

export const getNearbyArtisans = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 10 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required.' });
  }

  const artisans = await User.find({
    role: 'artisan',
    'artisanProfile.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: radius * 1000, // in meters
      },
    },
  }).select('email avatar artisanProfile');

  res.json({ total: artisans.length, artisans });
});

export const toggleAvailability = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user || user.role !== 'artisan') {
    return res.status(403).json({ message: 'Only artisans can toggle availability' });
  }

  if (!user.artisanProfile) {
    return res.status(400).json({ message: 'Artisan profile not found' });
  }

  user.artisanProfile.available = !user.artisanProfile.available;
  await user.save();

  res.json({
    available: user.artisanProfile.available,
    message: `Availability updated to ${user.artisanProfile.available}`,
  });
});
