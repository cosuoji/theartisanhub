import express from 'express';
import { uploadAvatar, uploadArtisanImages } from '../controllers/uploadController.js';
import { protectRoute, artisanOnly } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File upload endpoints (avatars, artisan work)
 */

/**
 * @swagger
 * /uploads/avatar:
 *   post:
 *     summary: Upload user avatar
 *     tags: [Uploads]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *       400:
 *         description: No file uploaded or invalid file
 *       401:
 *         description: Unauthorized
 */
router.post('/avatar', protectRoute, upload.single('avatar'), uploadAvatar);

/**
 * @swagger
 * /uploads/artisan-images:
 *   post:
 *     summary: Upload multiple artisan work images
 *     tags: [Uploads]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: No files uploaded
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/artisan-images',
  protectRoute,
  artisanOnly,
  upload.array('images', 5),
  uploadArtisanImages
);

export default router;
