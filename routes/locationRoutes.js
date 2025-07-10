import express from 'express';
import { getAllLocations } from '../controllers/locationController.js';

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
router.get('/', getAllLocations);

export default router;
