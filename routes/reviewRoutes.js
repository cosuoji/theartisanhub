import express from 'express';
import {
  createReview,
  getArtisanReviews,
  deleteMyReview,
  adminDeleteReview,
  getMyReviews,
} from '../controllers/reviewController.js';
import { protectRoute, adminRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Artisan review management
 */

/**
 * @swagger
 * /reviews/artisan/{artisanId}:
 *   get:
 *     summary: Get reviews for a specific artisan
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: artisanId
 *         schema:
 *           type: string
 *         required: true
 *         description: Artisan ID to fetch reviews for
 *     responses:
 *       200:
 *         description: Array of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router.get('/artisan/:artisanId', getArtisanReviews);


/**
 * @swagger
 * /reviews/my-reviews:
 *   get:
 *     summary: Get reviews submitted by the logged-in user
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of reviews submitted by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized – user not logged in
 */
router.get("/my-reviews", protectRoute, getMyReviews);


/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Leave a review for an artisan
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - artisanId
 *               - rating
 *             properties:
 *               artisanId:
 *                 type: string
 *                 example: 64ab1234de4567...
 *               rating:
 *                 type: number
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: "Very professional!"
 *     responses:
 *       201:
 *         description: Review created
 *       400:
 *         description: Validation or duplicate review error
 */
router.post('/', protectRoute, createReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete your own review
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted
 *       403:
 *         description: Not authorized
 */
router.delete('/:id', protectRoute, deleteMyReview);

/**
 * @swagger
 * /reviews/{id}/admin:
 *   delete:
 *     summary: Admin deletes any review
 *     tags: [Reviews]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted by admin
 *       403:
 *         description: Unauthorized
 */
router.delete('/:id/admin', protectRoute, adminRoute, adminDeleteReview);


export default router;
