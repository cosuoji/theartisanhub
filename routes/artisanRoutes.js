import express from 'express';
import {
  getArtisanDirectory,
  getArtisanById,
  updateArtisanProfile,
  getNearbyArtisans,
  toggleAvailability
} from '../controllers/artisanController.js';

import {
  protectRoute,
  emailVerified,
  artisanOnly
} from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /artisans:
 *   get:
 *     summary: Get list of public artisan profiles
 *     tags: [Artisans]
 *     parameters:
 *       - in: query
 *         name: skill
 *         schema:
 *           type: string
 *         description: Filter by skill
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Minimum average rating
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [rating, createdAt, experience]
 *         description: Sort by field
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Fuzzy search on name, bio, skills
 *     responses:
 *       200:
 *         description: A list of artisans
 */
router.get('/', getArtisanDirectory);

/**
 * @swagger
 * /artisans/{id}:
 *   get:
 *     summary: Get a single artisan's public profile
 *     tags: [Artisans]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Artisan ID
 *     responses:
 *       200:
 *         description: Artisan profile
 *       404:
 *         description: Artisan not found
 */
router.get('/:id', getArtisanById);

/**
 * @swagger
 * /artisans/nearby:
 *   get:
 *     summary: Get artisans near a given location
 *     tags: [Artisans]
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitude
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitude
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Radius in kilometers
 *     responses:
 *       200:
 *         description: List of nearby artisans
 */
router.get('/nearby', getNearbyArtisans);

/**
 * @swagger
 * /artisans/me/profile:
 *   put:
 *     summary: Update artisan profile (authenticated artisan)
 *     tags: [Artisans]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *               category:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               yearsOfExperience:
 *                 type: number
 *               location:
 *                 type: string
 *               available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated artisan profile
 *       403:
 *         description: Only artisans can update their profile
 */
router.put(
  '/me/profile',
  protectRoute,
  emailVerified,
  artisanOnly,
  updateArtisanProfile
);

/**
 * @swagger
 * /artisans/me/toggle-availability:
 *   patch:
 *     summary: Toggle artisan availability (authenticated)
 *     tags: [Artisans]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Availability status updated
 *       403:
 *         description: Only artisans can toggle availability
 */
router.patch(
  '/me/toggle-availability',
  protectRoute,
  emailVerified,
  artisanOnly,
  toggleAvailability
);

export default router;
