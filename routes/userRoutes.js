import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getUserById,
  getAllUsers,
  deleteUser,
  changeUserRole,
} from '../controllers/userController.js';
import { protectRoute, emailVerified, adminRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile and admin management
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get your own user profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Returns the authenticated user's profile
 *       401:
 *         description: Unauthorized or token missing
 *       403:
 *         description: Email not verified
 */
router.get('/me', protectRoute, emailVerified, getMyProfile);

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Update your user profile
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Email not verified
 */
router.put('/me', protectRoute, emailVerified, updateMyProfile);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a public user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User profile found
 *       404:
 *         description: User not found
 */
router.get('/:id', getUserById);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Admin - Get all users (paginated)
 *     tags: [Users]
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
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get('/', protectRoute, adminRoute, getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Admin - Delete a user by ID
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.delete('/:id', protectRoute, adminRoute, deleteUser);

/**
 * @swagger
 * /users/{id}/role:
 *   put:
 *     summary: Admin - Change a user's role
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, artisan, admin]
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.put('/:id/role', protectRoute, adminRoute, changeUserRole);

export default router;
