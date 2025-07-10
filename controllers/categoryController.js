// controllers/categoryController.js
import Category from '../models/Category.js';
import slugify from 'slugify';
import asyncHandler from 'express-async-handler';

/**
 * @desc    Get all artisan categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
});

/**
 * @desc    Create new artisan category
 * @route   POST /api/categories
 * @access  Admin
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const formattedName = name.trim();
  const slug = slugify(formattedName.toLowerCase());

  // Check for duplicates
  const exists = await Category.findOne({ slug });
  if (exists) {
    return res.status(400).json({ message: 'Category already exists' });
  }

  const category = await Category.create({ name: formattedName, slug });

  res.status(201).json(category);
});
