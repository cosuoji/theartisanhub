// controllers/featureController.js
import asyncHandler from "express-async-handler";
import User from "../models/User.js";

/**
 * @desc Feature an artisan for a given duration
 * @route PATCH /admin/artisans/:id/feature?duration=7d
 */
export const featureArtisan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { duration = "7d" } = req.query;

  const artisan = await User.findById(id);
  if (!artisan || artisan.role !== "artisan") {
    return res.status(404).json({ message: "Artisan not found" });
  }

  // Calculate duration in days
  let days = 7;
  if (duration.endsWith("d")) {
    days = parseInt(duration);
  } else if (duration.endsWith("m")) {
    days = parseInt(duration) * 30;
  }

  const featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  artisan.artisanProfile.featuredUntil = featuredUntil;
  artisan.artisanProfile.isCurrentlyFeatured = true;
  await artisan.save();

  res.json({
    message: `Artisan featured for ${days} days`,
    featuredUntil,
    isCurrentlyFeatured: artisan.artisanProfile.isCurrentlyFeatured,
  });
});

/**
 * @desc Toggle artisan feature (on/off)
 * @route PATCH /admin/artisans/:id/toggle-feature
 */
export const toggleFeatureArtisan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const artisan = await User.findById(id);
  if (!artisan || artisan.role !== "artisan") {
    return res.status(404).json({ message: "Artisan not found" });
  }

  const isCurrentlyFeatured =
    artisan.artisanProfile.featuredUntil &&
    artisan.artisanProfile.featuredUntil > new Date();

  if (isCurrentlyFeatured) {
    // 🧹 Unfeature artisan
    artisan.artisanProfile.featuredUntil = null;
    artisan.artisanProfile.isCurrentlyFeatured = false;
  } else {
    // ⭐ Feature artisan for default 7 days
    artisan.artisanProfile.featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    artisan.artisanProfile.isCurrentlyFeatured = true;
  }

  await artisan.save();

  res.json({
    message: artisan.artisanProfile.isCurrentlyFeatured
      ? "Artisan featured for 7 days"
      : "Artisan unfeatured successfully",
    featuredUntil: artisan.artisanProfile.featuredUntil,
    isCurrentlyFeatured: artisan.artisanProfile.isCurrentlyFeatured,
  });
});

/**
 * @desc Get all currently featured artisans (paginated, optional search)
 * @route GET /admin/artisans/featured
 * @query page (number), search (string)
 */
export const getFeaturedArtisans = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = 10;
  const skip = (page - 1) * limit;
  const search = (req.query.search || "").trim();

  // build query
  const baseQuery = {
    role: "artisan",
    "artisanProfile.featuredUntil": { $gt: new Date() },
  };

  if (search) {
    // search by name or email (case-insensitive)
    baseQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [featuredArtisans, count] = await Promise.all([
    User.find(baseQuery)
      .select("name email avatar artisanProfile")
      .sort({ "artisanProfile.featuredUntil": -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(baseQuery),
  ]);

  res.json({
    artisans: featuredArtisans,
    count,
    totalPages: Math.ceil(count / limit) || 1,
    page,
  });
});
