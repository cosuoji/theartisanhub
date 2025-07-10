import express from 'express';
import { adminRoute, protectRoute } from '../middleware/authMiddleware.js';
import {
  approveArtisanProfile,
  banUser,
  deleteUser,
  getAdminAnalytics,
  getAllUsers,
} from '../controllers/adminController.js';

const router = express.Router();

/**
 * @swagger
 * /admin/artisans/{id}/approve:
 *   patch:
 *     summary: Approve an artisan profile
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the artisan to approve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Artisan approved successfully
 *       404:
 *         description: Artisan not found
 */
router.patch(
  '/artisans/:id/approve',
  protectRoute,
  adminRoute,
  approveArtisanProfile
);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (paginated)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', protectRoute, adminRoute, getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user (soft or hard)
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: hard
 *         schema:
 *           type: boolean
 *         description: Set to true for hard delete
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', protectRoute, adminRoute, deleteUser);

/**
 * @swagger
 * /admin/users/{id}/ban:
 *   patch:
 *     summary: Ban or unban a user
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the user to ban/unban
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isBanned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User ban status updated
 */
router.patch('/users/:id/ban', protectRoute, adminRoute, banUser);

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get dashboard analytics
 *     tags: [Admin]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Admin analytics
 */
router.get('/analytics', protectRoute, adminRoute, getAdminAnalytics);

export default router;
