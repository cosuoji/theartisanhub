// controllers/jobController.js
import Job from '../models/Job.js';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const createJob = asyncHandler(async (req, res) => {
  const { artisanId, description, title } = req.body;

  const artisan = await User.findById(artisanId);
  if (!artisan || artisan.role !== 'artisan') {
    return res.status(404).json({ message: 'Artisan not found' });
  }

  const job = await Job.create({
    user: req.user._id,
    artisan: artisanId,
    title,
    description,
    status: 'pending',
  });

  res.status(201).json(job);
});

export const getUserJobs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Job.countDocuments({ user: req.user._id });
  const jobs = await Job.find({ user: req.user._id })
    .populate('artisan', 'name _id') // Important for linking
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({ jobs, total });
});

export const markJobCompleted = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job) return res.status(404).json({ message: 'Job not found' });
  if (job.artisan.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'You can only mark your own jobs as completed' });
  }

  job.status = 'completed';
  await job.save();

  res.json({ message: 'Job marked as completed' });
});


// 🔍 GET /jobs/:id - User fetches single job
export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('artisan', 'name avatar')
    .populate('user', 'name email');

  if (!job) return res.status(404).json({ message: 'Job not found' });

  // Allow only the user who created the job or the artisan assigned
  if (
    job.user.toString() !== req.user._id.toString() &&
    job.artisan.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json(job);
});

// 🛠️ PATCH /jobs/:id/status - Artisan updates job status (e.g., 'accepted', 'in-progress', etc.)
export const updateJobStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'accepted', 'in-progress', 'completed', 'cancelled'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  if (job.artisan.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only assigned artisan can update status' });
  }

  job.status = status;
  await job.save();

  res.json({ message: `Job status updated to ${status}` });
});

// ❌ DELETE /jobs/:id - User cancels their job if still pending
export const cancelJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  if (job.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Only the job owner can cancel it' });
  }

  if (job.status !== 'pending') {
    return res.status(400).json({ message: 'Only pending jobs can be cancelled' });
  }

  job.status = 'cancelled';
  await job.save();

  res.json({ message: 'Job cancelled' });
});

// 🔐 Admin-only: GET /admin/jobs
export const getAllJobs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find()
      .populate('user', 'email')
      .populate('artisan', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Job.countDocuments(),
  ]);

  res.json({
    jobs,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});
