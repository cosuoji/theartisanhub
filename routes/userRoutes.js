import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getUserById,
  getAllUsers,
  deleteUser,
  changeUserRole,
  updateUserProfile,
  toggleFavourite,
  getFavourite,
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
router.patch('/profile', protectRoute, updateUserProfile);
router.get('/', protectRoute, adminRoute, getAllUsers);
router.get("/favourites", protectRoute, getFavourite)
router.patch("/favourites/:artisanId", protectRoute, toggleFavourite)
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


/**
 * @swagger
 * /auth/profile:
 *   patch:
 *     summary: Update user profile (phone and address)
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+2347012345678"
 *               address:
 *                 type: string
 *                 example: "123 Artisan Lane, Lagos, Nigeria"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request – invalid input
 *       401:
 *         description: Unauthorized – not logged in
 */


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
