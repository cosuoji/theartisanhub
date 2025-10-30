import express from 'express';
import { uploadAvatar, uploadArtisanImages, removeArtisanImage } from '../controllers/uploadController.js';
import { protectRoute, artisanOnly } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/upload.js';
import rateLimit from 'express-rate-limit';

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Too many uploads, try again later.',
});


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
router.post('/avatar', uploadLimiter, protectRoute, upload.single('file'), uploadAvatar);

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
  uploadLimiter,
  protectRoute,
  artisanOnly,
  upload.array('images', 5),
  uploadArtisanImages
);

/**
 * @swagger
 * /artisan-images:
 *   delete:
 *     summary: Remove an uploaded image from an artisan's portfolio
 *     description: Deletes an image from ImageKit and removes it from the artisan's profile.
 *     tags:
 *       - Artisan
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: Full URL of the image to remove
 *                 example: https://ik.imagekit.io/your_app/artisan-work/sample.jpg
 *     responses:
 *       200:
 *         description: Image removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Image removed successfully
 *       400:
 *         description: Image URL not provided
 *       401:
 *         description: Unauthorized or unauthenticated
 *       404:
 *         description: Image not found in profile or user not found
 */


router.delete(
  '/artisan-images',
  protectRoute,
  artisanOnly,
  removeArtisanImage
);

export default router;
