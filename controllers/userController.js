import User from '../models/User.js';
import asyncHandler from 'express-async-handler';


// ✅ 1. Get own profile
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// ✅ 2. Update own profile
export const updateMyProfile = asyncHandler(async (req, res) => {
  const updates = req.body;
  const allowedUpdates = ['name', 'phone', 'avatar'];

  const payload = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedUpdates.includes(key))
  );

  const user = await User.findByIdAndUpdate(req.user._id, payload, { new: true }).select('-password');
  res.json(user);
});

// ✅ 3. Get public profile by ID
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, isDeleted: false }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// ✅ 4. Admin: get all users (with pagination & filtering)
export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const role = req.query.role;
  const isBanned = req.query.banned;

  const query = { isDeleted: false };
  if (role) query.role = role;
  if (isBanned !== undefined) query.isBanned = isBanned === 'true';

  const [users, total] = await Promise.all([
    User.find(query).select('-password').skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  res.json({
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

// ✅ 5. Admin: soft delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User soft-deleted' });
});

// ✅ 6. Admin: change user role
export const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const allowedRoles = ['user', 'artisan', 'admin'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ message: `Role updated to ${role}`, user });
});

// ✅ 7. Admin: ban/unban user
export const toggleBanUser = asyncHandler(async (req, res) => {
  const { isBanned } = req.body;

  const user = await User.findByIdAndUpdate(req.params.id, { isBanned }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ message: `User has been ${isBanned ? 'banned' : 'unbanned'}` });
});

// controllers/userController.js
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { phone, address } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.phone = phone || user.phone;
  user.address = address || user.address;

  await user.save();
  res.json({ message: 'Profile updated', user });
});
