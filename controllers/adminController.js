import User from "../models/User.js";
import asyncHandler from 'express-async-handler';


export const approveArtisanProfile = asyncHandler(async (req, res) => {
    const artisan = await User.findById(req.params.id);
  
    if (!artisan || artisan.role !== 'artisan') {
      return res.status(404).json({ message: 'Artisan not found' });
    }
  
    if (!artisan.artisanProfile) {
      artisan.artisanProfile = {};
    }
  
    artisan.artisanProfile.isVerified = true;
    await artisan.save();
  
    res.json({ message: 'Artisan approved and verified', artisan });
  });

  export const getAllUsers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, role, isBanned } = req.query;
    const skip = (page - 1) * limit;
  
    const filter = {};
  
    if (role) filter.role = role;
    if (isBanned !== undefined) filter.isBanned = isBanned === 'true';
  
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(Number(limit)).select('-password'),
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
      verifiedArtisans,
      softDeletedUsers,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'artisan' }),
      User.countDocuments({ isBanned: true }),
      User.countDocuments({ role: 'artisan', 'artisanProfile.isVerified': true }),
      User.countDocuments({ isDeleted: true }),
    ]);
  
    res.json({
      totalUsers,
      totalArtisans,
      bannedUsers,
      verifiedArtisans,
      softDeletedUsers,
    });
  });
   
  