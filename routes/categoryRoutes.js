import express from 'express';
import { getCategories, createCategory } from '../controllers/categoryController.js';
import { protectRoute, adminRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Artisan category management
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all artisan categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   slug:
 *                     type: string
 */
router.get('/', getCategories);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category (admin only)
 *     tags: [Categories]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Electrician
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Missing or invalid input
 *       403:
 *         description: Unauthorized
 */
router.post('/', protectRoute, adminRoute, createCategory);

export default router;
