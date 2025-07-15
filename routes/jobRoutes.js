import express from 'express';
import {
  createJob,
  getUserJobs,
  getJobById,
  updateJobStatus,
  cancelJob,
  markJobCompleted,
  getAllJobs,
  checkCanReview,
  getArtisanJobs
} from '../controllers/jobController.js';

import {
  protectRoute,
  artisanOnly,
  adminRoute,
} from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Booking jobs between users and artisans
 */

/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Create a new job request
 *     tags: [Jobs]
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
 *               - description
 *             properties:
 *               artisanId:
 *                 type: string
 *               description:
 *                 type: string
 *                 example: "Fix leaking kitchen sink"
 *     responses:
 *       201:
 *         description: Job created
 *       404:
 *         description: Artisan not found
 */
router.post('/', protectRoute, createJob);

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs created by the logged-in user
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get('/', protectRoute, getUserJobs);

router.get('/artisan', protectRoute, getArtisanJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get details of a single job by ID
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get('/:id', protectRoute, getJobById);

/**
 * @swagger
 * /jobs/{id}:
 *   delete:
 *     summary: Cancel a job request
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job cancelled
 *       404:
 *         description: Job not found
 */
router.delete('/:id', protectRoute, cancelJob);

/**
 * @swagger
 * /jobs/{id}/status:
 *   patch:
 *     summary: Artisan updates job status (e.g., accepted, in-progress)
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, in-progress, completed]
 *     responses:
 *       200:
 *         description: Job status updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Job not found
 */
router.patch('/:id/status', protectRoute, artisanOnly, updateJobStatus);

/**
 * @swagger
 * /jobs/{jobId}/complete:
 *   patch:
 *     summary: Artisan marks job as completed
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema:
 *           type: string
 *         required: true
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job marked as completed
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Job not found
 */
router.patch('/:jobId/complete', protectRoute, artisanOnly, markJobCompleted);

/**
 * @swagger
 * /jobs/admin/all:
 *   get:
 *     summary: Admin view of all jobs in the system
 *     tags: [Jobs]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all jobs
 *       403:
 *         description: Forbidden
 */
router.get('/admin/all', protectRoute, adminRoute, getAllJobs);

// routes/jobRoutes.js
router.get('/can-review/:artisanId', protectRoute, checkCanReview);


export default router;
