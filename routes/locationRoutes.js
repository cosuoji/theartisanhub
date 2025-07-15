import express from 'express';
import { createLocation, getAllLocations, getLocationById, toggleLocationStatus } from '../controllers/locationController.js';
import { adminRoute, protectRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Artisan location utilities
 */

/**
 * @swagger
 * /locations:
 *   get:
 *     summary: Get all distinct artisan locations
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: Array of unique city/location strings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *                 example: Lagos
 */
/**
 * @swagger
 * /locations:
 *   post:
 *     tags:
 *       - Locations
 *     summary: Admin creates a new location with geocoding
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               state:
 *                 type: string
 *     responses:
 *       201:
 *         description: Location created
 *       400:
 *         description: Invalid input
 *
 * /locations/{id}/toggle:
 *   patch:
 *     tags:
 *       - Locations
 *     summary: Toggle active status for a location (admin)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /locations/{id}:
 *   get:
 *     tags:
 *       - Locations
 *     summary: Get a location by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the location to retrieve
 *     responses:
 *       200:
 *         description: Location found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 state:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *                 coordinates:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: Point
 *                     coordinates:
 *                       type: array
 *                       items:
 *                         type: number
 *                       example: [3.4205, 6.4281]
 *       404:
 *         description: Location not found
 *       500:
 *         description: Server error
 */

router.get('/', getAllLocations);

router.post('/', protectRoute, adminRoute, createLocation);

router.patch('/:id/toggle', protectRoute, adminRoute, toggleLocationStatus); // ✅ Add this line
router.get('/:id', getLocationById);


export default router;
