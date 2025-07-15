// controllers/locationController.js
import asyncHandler from 'express-async-handler';
import Location from '../models/Location.js';
import { geocodeAddress } from '../utils/geocoder.js';

/**
 * @desc    Get list of all unique artisan locations
 * @route   GET /api/locations
 * @access  Public
 */

export const getAllLocations = asyncHandler(async (req, res) => {
  const locations = await Location.find()
    .select('name state coordinates isActive') // keep it lean
    .sort({ name: 1 });

  res.json(locations);
});


export const createLocation = asyncHandler(async (req, res) => {
  const { name, state } = req.body;

  const existing = await Location.findOne({ name: name.trim().toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: 'Location already exists' });
  }

  const coordinates = await geocodeAddress(name);

  const newLocation = await Location.create({
    name: name.trim().toLowerCase(),
    state: state || 'Lagos',
    coordinates: coordinates || {
      type: 'Point',
      coordinates: [0, 0], // fallback
    },
  });

  res.status(201).json(newLocation);
});

export const toggleLocationStatus = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) {
    return res.status(404).json({ message: 'Location not found' });
  }

  location.isActive = !location.isActive;
  await location.save();

  res.status(200).json({ message: 'Location status updated', isActive: location.isActive });
});

// @desc    Get a location by ID
// @route   GET /locations/:id
// @access  Public or Admin
export const getLocationById = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);

  if (!location) {
    return res.status(404).json({ message: 'Location not found' });
  }

  res.json(location);
});
