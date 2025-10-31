import express from 'express';
import { adminRoute, protectRoute } from '../middleware/authMiddleware.js';
import {
  approveArtisanProfile,
  banUser,
  deleteUser,
  getAdminAnalytics,
  getAllUsers,
  restoreDeletedUser,
} from '../controllers/adminController.js';
import AuditLog from '../models/AuditLog.js';
import asyncHandler from 'express-async-handler';
import {
  featureArtisan,
  toggleFeatureArtisan,
  getFeaturedArtisans,
} from '../controllers/featureController.js';



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
 *     summary: Get paginated list of users with optional filters and sorting
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 20
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, artisan, admin]
 *       - in: query
 *         name: isBanned
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, email, role, status]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
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

/**
 * @swagger
 * /admin/users/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User restored successfully
 *       400:
 *         description: User is not deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

router.patch('/users/:id/restore', protectRoute, adminRoute, restoreDeletedUser);

router.get('/audit-logs', protectRoute, adminRoute, asyncHandler(async (req, res) => {
  const logs = await AuditLog.find()
    .populate('actor', 'name email')
    .populate('target')
    .sort({ createdAt: -1 })
    .limit(100);
  res.json(logs);
}));


// 📋 Get all currently featured artisans
router.get(
  '/artisans/featured',
  protectRoute,
  adminRoute,
  getFeaturedArtisans
);



// 🌟 Feature an artisan for a set duration (7d, 30d, etc.)
router.patch(
  '/artisans/:id/feature',
  protectRoute,
  adminRoute,
  featureArtisan
);

// 🔁 Toggle featured status manually
router.patch(
  '/artisans/:id/toggle-feature',
  protectRoute,
  adminRoute,
  toggleFeatureArtisan
);



export default router;
