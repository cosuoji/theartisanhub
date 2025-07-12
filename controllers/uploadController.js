// controllers/uploadController.js
import asyncHandler from 'express-async-handler';
import { imagekit } from '../utils/imagekit.js';

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { originalname, buffer } = req.file;

  const uploaded = await imagekit.upload({
    file: buffer,
    fileName: originalname,
    folder: 'avatars',
  });

  res.json({ url: uploaded.url });
});


export const uploadArtisanImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const existing = user.artisanProfile.portfolioImages || [];
  if (existing.length + urls.length > 10) {
    return res.status(400).json({ message: 'Maximum 10 images allowed' });
  }

  const uploads = await Promise.all(
    req.files.map((file) =>
      imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
        folder: 'artisan-work',
      })
    )
  );

  const urls = uploads.map((img) => img.url);

  // ✅ Save URLs to the artisan profile
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.artisanProfile.portfolioImages = [
    ...(user.artisanProfile.portfolioImages || []),
    ...urls,
  ];

  await user.save();

  res.status(201).json({ urls });
});

export const removeArtisanImage = asyncHandler(async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ message: 'Image URL is required' });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Remove image from artisanProfile.portfolioImages
  const oldImages = user.artisanProfile?.portfolioImages || [];

  if (!oldImages.includes(imageUrl)) {
    return res.status(404).json({ message: 'Image not found in profile' });
  }

  user.artisanProfile.portfolioImages = oldImages.filter((url) => url !== imageUrl);

  // Try to delete the file from ImageKit (get fileId from URL)
  const filePath = decodeURIComponent(new URL(imageUrl).pathname);
  const fileName = filePath.split('/').pop(); // e.g. artisan-work/my-photo.jpg

  try {
    const result = await imagekit.listFiles({ searchQuery: `name="${fileName}"` });

    if (result.length > 0) {
      await imagekit.deleteFile(result[0].fileId);
    }
  } catch (err) {
    console.warn('⚠️ Could not delete from ImageKit:', err.message);
    // Proceed anyway; deletion from profile is more important
  }

  await user.save();

  res.status(200).json({ message: 'Image removed successfully' });
});
