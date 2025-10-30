import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import Location from "../models/Location.js"
import geocodeNewAddress from '../utils/geocoder.js';
//import { cacheGet, cacheSet, cacheDelPattern } from '../utils/cache.js';
//import { geoQueue } from '../jobs/index.js';



// For the list view (with full filtering)
export const getArtisanDirectory = asyncHandler(async (req, res) => {
  const { mapOnly } = req.query;
  const limit = mapOnly ? 0 : Math.min(parseInt(req.query.limit) || 20, 100);
  const {
    skill, location, category, page = 1,
    sortBy, minRating, available, onlyApproved, minYears
  } = req.query;

  const filter = { role: 'artisan', isDeleted: false };

  // Filters
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

  res.json({
    artisans,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / limit),
  });
});

  
// Get single artisan public profile
export const getArtisanById = asyncHandler(async (req, res) => {
  const artisan = await User.findOne({
    _id: req.params.id,
    role: 'artisan',
    isDeleted: false,
  })
    .select('-password')
    .populate('artisanProfile.location', 'name');

  if (!artisan) {
    return res.status(404).json({ message: 'Artisan not found' });
  }

  // Share preview
  if (req.query.share === 'true') {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta property="og:title" content="${artisan.name}" />
          <meta property="og:description" content="${
            artisan.artisanProfile?.bio || 'Artisan on ArtisanHub'
          }" />
          <meta property="og:image" content="${artisan.avatar}" />
          <meta property="og:url" content="${
            process.env.CLIENT_URL
          }/artisans/${artisan._id}" />
          <meta http-equiv="refresh" content="0; url=${
            process.env.CLIENT_URL
          }/artisans/${artisan._id}" />
        </head>
        <body>Redirecting to profile…</body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(html);
  }

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
    //await geoQueue.add('geocode', { address: updates.address, userId: user._id });
    const geo = await geocodeNewAddress(updates.address);
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
  //await cacheDelPattern('artisan_dir:*'); // bust every cached 
  res.json(user);
});


// controllers/artisanController.js
export const getNearbyArtisans = asyncHandler(async (req, res) => {
  const { lat, lng, radius = 3, skill, available, onlyApproved, page = 1, limit = 10 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Latitude and longitude are required.' });
  }

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const parsedRadius = parseFloat(radius) * 1000; // convert to meters
  const skip = (Number(page) - 1) * Number(limit);

  // Build the query for geoNear
  const geoQuery = {
    role: 'artisan',
    isDeleted: false,
    ...(skill && { 'artisanProfile.skills': { $in: [skill] } }),
    ...(onlyApproved !== undefined && { 'artisanProfile.isApproved': onlyApproved === 'true' }),
    ...(available !== undefined && { 'artisanProfile.available': available === 'true' }),
  };

  const geoNearStage = {
    $geoNear: {
      near: {
        type: 'Point',
        coordinates: [parsedLng, parsedLat],
      },
      distanceField: 'distance',
      maxDistance: parsedRadius,
      spherical: true,
      query: geoQuery,
    },
  };

  const pipeline = [
    geoNearStage,
    {
      $project: {
        email: 1,
        name: 1,
        rating: 1,
        avatar: 1,
        artisanProfile: 1,
        distance: 1,
      },
    },
    { $skip: skip },
    { $limit: Number(limit) },
  ];

  const [results, countResults] = await Promise.all([
    User.aggregate(pipeline),
    User.aggregate([
      geoNearStage,
      { $count: 'total' },
    ]),
  ]);

  const total = countResults[0]?.total || 0;

  res.json({
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    artisans: results,
  });
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
  //await cacheDelPattern('artisan_dir:*'); // bust every cached 

  res.json({
    available: user.artisanProfile.available,
    message: `Availability updated to ${user.artisanProfile.available}`,
  });
});

// PATCH /artisans/me/availability
export const updateAvailability = asyncHandler(async (req, res) => {
  const { slots } = req.body; // [{ start: ISO, end: ISO }]
  const user = await User.findById(req.user._id);
  if (user.role !== 'artisan') return res.status(403).json({ message: 'Forbidden' });

  user.artisanProfile.availabilitySlots = slots;
  await user.save();
  res.json({ message: 'Availability updated', slots });
});