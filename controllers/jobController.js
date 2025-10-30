// controllers/jobController.js
import Job from '../models/Job.js';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Review from '../models/Review.js';
//import { redis } from '../utils/redis.js';


export const createJob = asyncHandler(async (req, res) => {
  const { artisanId, heading, description} = req.body;
  //const { referrer } = req.body; // e.g. ?ref=ABC123

  // if (referrer) {
  //   const referrerId = await redis.get(`referral_code:${referrer}`);
  //   if (referrerId) await recordReferral(referrerId, req.user._id);
  // }


  const artisan = await User.findById(artisanId);
  if (!artisan || artisan.role !== 'artisan') {
    return res.status(404).json({ message: 'Artisan not found' });
  }

  // ❌ Prevent self-booking
  if (req.user._id.toString() === artisanId.toString()) {
    return res.status(403).json({ message: "You can't book yourself." });
  }

  const job = await Job.create({
    user: req.user._id,
    artisan: artisanId,
    heading,
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
    .populate("heading")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({ jobs, total });
});

export const getArtisanJobs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [total, jobs] = await Promise.all([
    Job.countDocuments({ artisan: req.user._id }),
    Job.find({ artisan: req.user._id })
      .populate('artisan', 'name _id') // keep artisan info minimal
      .populate('user', 'name email phone') // ✅ show client details
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);
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

  if (job.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: 'Only the job owner or admin can cancel it' });
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
  const { page = 1, limit = 10, status, startDate, endDate } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
if (status) filter.status = status;
if (startDate && endDate) {
  filter.createdAt = {
    $gte: new Date(startDate),
    $lte: new Date(endDate),
  };
}

  const [jobs, total] = await Promise.all([
    Job.find()
      .populate('user', 'email')
      .populate('artisan', 'email',)
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

// GET /jobs/can-review/:artisanId
export const checkCanReview = asyncHandler(async (req, res) => {
  const { artisanId } = req.params;
  const userId = req.user._id;

  // ❌ Prevent self-check
  if (userId.toString() === artisanId.toString()) {
    return res.status(403).json({ canReview: false });
  }

  const job = await Job.findOne({
    user: userId,
    artisan: artisanId,
    status: 'completed',
  });

  res.json({ canReview: !!job });
});

// controllers/jobController.js
export const getJobsEligibleForReview = asyncHandler(async (req, res) => {
  const jobs = await Job.find({
    artisan: req.params.artisanId,
    user: req.user._id,
    status: "completed",
  }).select("_id title createdAt heading");

  res.json({ jobs });
});

// 📥 Get all completed but unreviewed jobs for a specific artisan
export const getUnreviewedJobs = asyncHandler(async (req, res) => {
  const { artisanId } = req.params;

  const jobs = await Job.find({
    user: req.user._id,
    artisan: artisanId,
    status: 'completed',
    _id: { $nin: await Review.distinct('job', { user: req.user._id }) }, // exclude reviewed jobs
  }).select('heading description _id createdAt');

  res.json({ jobs });
});
