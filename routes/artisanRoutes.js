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
import { getArtisanStats } from '../controllers/authController.js';

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
router.get('/nearby', getNearbyArtisans);

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

/**
 /artisans/me/stats:
  get:
    tags:
      - Artisan
    summary: Get artisan performance stats
    description: Returns performance stats for the authenticated artisan such as total jobs completed, average rating, and review count.
    security:
      - bearerAuth: []
    responses:
      '200':
        description: Stats retrieved successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                totalJobs:
                  type: integer
                  example: 7
                averageRating:
                  type: number
                  format: float
                  example: 4.5
                reviewCount:
                  type: integer
                  example: 13
                available:
                  type: boolean
                  example: true
      '401':
        $ref: '#/components/responses/UnauthorizedError'
      '403':
        description: Forbidden - Only artisans can access this route
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Error'
      '500':
        $ref: '#/components/responses/ServerError'

 */
router.get('/me/stats', protectRoute, emailVerified, artisanOnly, getArtisanStats);
router.get('/:id', getArtisanById);

export default router;
