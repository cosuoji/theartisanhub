// controllers/reviewController.js
import Review from '../models/Review.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import Job from '../models/Job.js';


// 🚀 Create a new review
export const createReview = asyncHandler(async (req, res) => {
  const { artisanId, rating, comment } = req.body;

  const artisan = await User.findById(artisanId);
  if (!artisan || artisan.role !== 'artisan') {
    return res.status(404).json({ message: 'Artisan not found' });
  }

  // ❌ Prevent self-review
  if (req.user._id.toString() === artisanId.toString()) {
    return res.status(403).json({ message: "You can't review yourself." });
  }

  // 🔒 Must verify email
  if (!req.user.isVerified) {
    return res.status(403).json({ message: "Please verify your email to leave reviews." });
  }

  // ✅ Ensure the user has completed a job with the artisan
  const completedJob = await Job.findOne({
    user: req.user._id,
    artisan: artisan._id,
    status: 'completed',
  });

  if (!completedJob) {
    return res.status(403).json({ message: 'You must complete a job with this artisan to leave a review.' });
  }

  // ✅ Validate input
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  if (comment && comment.length > 500) {
    return res.status(400).json({ message: 'Comment is too long (max 500 characters).' });
  }

  try {
    const review = await Review.create({
      artisan: artisanId,
      user: req.user._id,
      rating,
      comment,
    });

    // 📊 Update artisan average rating
    const result = await Review.aggregate([
      { $match: { artisan: artisan._id } },
      { $group: { _id: '$artisan', avgRating: { $avg: '$rating' } } },
    ]);
    const avgRating = result[0]?.avgRating || 0;
    artisan.rating = avgRating.toFixed(1);
    await artisan.save();

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this artisan.' });
    }
    throw err;
  }
});


// 📥 Get reviews for artisan (with pagination)
export const getArtisanReviews = asyncHandler(async (req, res) => {
  const { artisanId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ artisan: artisanId })
      .populate('user', 'name avatar')
      .sort({createdAt: -1})
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ artisan: artisanId }),
  ]);

  res.json({
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});


// ❌ Delete own review
export const deleteMyReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!review) {
    return res.status(404).json({ message: 'Review not found or not yours' });
  }

  await review.deleteOne();

  // Recalculate rating
  const artisan = await User.findById(review.artisan);
  const result = await Review.aggregate([
    { $match: { artisan: artisan._id } },
    { $group: { _id: '$artisan', avgRating: { $avg: '$rating' } } },
  ]);
  const avgRating = result[0]?.avgRating || 0;
  artisan.rating = avgRating.toFixed(1);
  await artisan.save();

  res.json({ message: 'Review deleted' });
});

// 🛠 Admin deletes any review
export const adminDeleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  await review.deleteOne();

  const artisan = await User.findById(review.artisan);
  const result = await Review.aggregate([
    { $match: { artisan: artisan._id } },
    { $group: { _id: '$artisan', avgRating: { $avg: '$rating' } } },
  ]);
  const avgRating = result[0]?.avgRating || 0;
  artisan.rating = avgRating.toFixed(1);
  await artisan.save();

  res.json({ message: 'Review deleted by admin' });
});

// controllers/reviewController.js
// controllers/reviewController.js
export const getMyReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ user: req.user._id })
      .populate('artisan', 'name _id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ user: req.user._id }),
  ]);

  res.json({
    reviews,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});
