import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import Location from "../models/Location.js"
import geocodeNewAddress from '../utils/geocoder.js';
import { cacheGet, cacheSet } from '../utils/cache.js';



// Get public list of artisans

// For the map view (markers only)
export const getMapArtisans = asyncHandler(async (req, res) => {
  const { location } = req.query;
  
  const filter = { 
    role: 'artisan', 
    isDeleted: false,
    'artisanProfile.coordinates': { $exists: true } // Only artisans with geo data
  };

  // Optional location filter
  if (location) {
    const locDoc = await Location.findOne({ 
      name: new RegExp(`^${location}$`, 'i') 
    });
    if (locDoc) {
      filter['artisanProfile.location'] = locDoc._id;
    }
  }

  const artisans = await User.find(filter)
    .select('name artisanProfile.coordinates artisanProfile.skills artisanProfile.location')
    .populate('artisanProfile.location', 'name')
    .limit(500); // Safety limit

  res.json({ artisans });
});

// For the list view (with full filtering)
export const getArtisanDirectory = asyncHandler(async (req, res) => {
  const {
    skill, location, category, page = 1, limit = 20,
    sortBy, minRating, available, onlyApproved, minYears
  } = req.query;

  // Cache key (excludes pagination for better cache hits)
  const cacheKey = `artisan_dir:${JSON.stringify({
    skill, location, category, minRating, available, onlyApproved, minYears, sortBy
  })}`;

  // Try cache first
  const cached = await cacheGet(cacheKey);
  if (cached) return res.json({ 
    ...cached,
    page: parseInt(page),
    totalPages: Math.ceil(cached.total / limit)
  });

  const filter = { role: 'artisan', isDeleted: false };

  // Filter building (same as before)
  if (onlyApproved === 'true') filter['artisanProfile.isVerified'] = true;
  if (available) filter['artisanProfile.available'] = available === 'true';
  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (minYears) filter['artisanProfile.yearsOfExperience'] = { $gte: Number(minYears) };
  if (skill) filter['artisanProfile.skills'] = { $in: [new RegExp(skill, 'i')] };
  if (category) filter['artisanProfile.category'] = new RegExp(category, 'i');
  
  if (location) {
    const locDoc = await Location.findOne({ name: new RegExp(`^${location}$`, 'i') });
    if (locDoc) {
      filter['artisanProfile.location'] = locDoc._id;
    } else {
      return res.status(400).json({ message: 'Invalid location specified' });
    }
  }

  // Sorting
  const sortOption = {};
  if (sortBy === 'rating') sortOption.rating = -1;
  else if (sortBy === 'experience') sortOption['artisanProfile.yearsOfExperience'] = -1;
  else sortOption.createdAt = -1;

  const [artisans, total] = await Promise.all([
    User.find(filter)
      .select('email avatar artisanProfile rating name')
      .populate('artisanProfile.location', 'name')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort(sortOption),
    User.countDocuments(filter)
  ]);

  const result = {
    artisans,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  };

  await cacheSet(cacheKey, result, 300);
  res.json(result);
});
  
// Get single artisan public profile
export const getArtisanById = asyncHandler(async (req, res) => {
  const artisan = await User.findOne({ _id: req.params.id, role: 'artisan', isDeleted: false}).select('-password').populate('artisanProfile.location', 'name');
  if (!artisan) return res.status(404).json({ message: 'Artisan not found' });
  res.json(artisan);
});


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

  // ✅ Validate phone number
  if (updates.phone && !/^0\d{10}$/.test(updates.phone)) {
    return res.status(400).json({ message: 'Phone number must be 11 digits and start with 0' });
  }

  // ✅ Create artisanProfile if not present
  if (!user.artisanProfile) user.artisanProfile = {};

  // ✅ Validate skill count
  if (updates.skills && updates.skills.length > 5) {
    return res.status(400).json({ message: 'You can only list up to 5 skills.' });
  }

  // ✅ Update fields except location
  const profileFields = ['bio', 'skills', 'yearsOfExperience', 'available', 'address'];
  profileFields.forEach((field) => {
    if (updates[field] !== undefined) {
      user.artisanProfile[field] = updates[field];
    }
  });

  
// ✅ If a new address is provided, try geocoding it
if (updates.address) {
  try {
    await geoQueue.add('geocode', { address: updates.address, userId: user._id });
    //const geo = await geocodeNewAddress(updates.address);
    user.artisanProfile.coordinates = {
      type: 'Point',
      coordinates: [geo.lng, geo.lat],
    };
  } catch (err) {
    console.error('Geocoding failed:', err.message);
    // Optional: fallback to leaving coordinates unchanged
  }
}

  // ✅ Handle location update via Location model
  if (updates.location) {
    try {
      const locDoc = await Location.findOne({ name: new RegExp(`^${updates.location}$`, 'i') });

      if (!locDoc) {
        return res.status(400).json({ message: 'Invalid location. Please select a valid city.' });
      }

      user.artisanProfile.location = locDoc._id;

      // Optional: update coordinates
      if (locDoc.coordinates?.coordinates?.length === 2) {
        user.artisanProfile.coordinates = {
          type: 'Point',
          coordinates: locDoc.coordinates.coordinates,
        };
      }
    } catch (err) {
      console.error('Error processing location:', err.message);
      return res.status(500).json({ message: 'Failed to update location' });
    }
  }

  await user.save();
  res.json(user);
});

export const getNearbyArtisans = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 1} = req.query;

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
  }).select('email avatar artisanProfile rating name')

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
