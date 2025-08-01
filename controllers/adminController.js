import User from "../models/User.js";
import asyncHandler from 'express-async-handler';
import { logAction } from '../utils/audit.js';
import Job from "../models/Job.js";
import Review from "../models/Review.js";



export const approveArtisanProfile = asyncHandler(async (req, res) => {
    const artisan = await User.findById(req.params.id);
  
    if (!artisan || artisan.role !== 'artisan') {
      return res.status(404).json({ message: 'Artisan not found' });
    }
  
    if (!artisan.artisanProfile) {
      artisan.artisanProfile = {};
    }
  
    artisan.artisanProfile.isApproved = true;
    await artisan.save();
    await logAction(req.user, artisan, 'approve-artisan');
  
    res.json({ message: 'Artisan approved and verified', artisan });
  });

// controllers/adminController.js

export const getAllUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    role,
    isBanned,
    sortBy = 'name',
    sortOrder = 'asc',
  } = req.query;

  const skip = (page - 1) * limit;
  const filter = {};

  if (role) filter.role = role;
  if (isBanned !== undefined) filter.isBanned = isBanned === 'true';

  const sortOptions = {};
  const validSortFields = ['name', 'email', 'role', 'status'];

  if (validSortFields.includes(sortBy)) {
    const sortField = sortBy === 'status' ? 'isBanned' : sortBy;
    sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort(sortOptions)
      .skip(Number(skip))
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.json({
    users,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  });
});

  export const banUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
  
    user.isBanned = !user.isBanned;
    await user.save();
    await logAction(req.user, user, user.isBanned ? 'ban' : 'unban');
  
    res.json({
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
      userId: user._id,
      isBanned: user.isBanned,
    });
  });
  

  export const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const hardDelete = req.query.hard === 'true';
  
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
  
    if (hardDelete) {
      await user.deleteOne();
      return res.json({ message: 'User permanently deleted', userId });
    }
  
    user.isDeleted = true;
    await user.save();
    res.json({ message: 'User soft-deleted (marked inactive)', userId });
  });

  export const getAdminAnalytics = asyncHandler(async (req, res) => {
    const [
      totalUsers,
      totalArtisans,
      bannedUsers,
      approvedArtisans,
      softDeletedUsers,
      totalJobs,
      completedJobs,
      pendingJobs,
      totalReviews,
      
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'artisan' }),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ role: 'artisan', 'artisanProfile.isApproved': true }),
      User.countDocuments({ isDeleted: true }),
      Job.countDocuments({}),
      Job.countDocuments({ status: 'completed' }),
      Job.countDocuments({ status: 'pending' }),
      Review.countDocuments({}),
    ]);
  
    res.json({
      totalUsers,
      totalArtisans,
      bannedUsers,
      approvedArtisans,
      softDeletedUsers,
      totalJobs,
      completedJobs,
      pendingJobs,
      totalReviews,
    });
  });
   
  // controllers/adminController.js
export const restoreDeletedUser = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (!user.isDeleted) {
    return res.status(400).json({ message: 'User is not deleted' });
  }

  user.isDeleted = false;
  await user.save();

  res.json({ message: 'User restored successfully', userId });
});
