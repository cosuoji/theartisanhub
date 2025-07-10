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
  res.status(201).json({ urls });
});
