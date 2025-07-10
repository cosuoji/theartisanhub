import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
	storage,
	limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
	fileFilter: (req, file, cb) => {
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
		if (!allowedTypes.includes(file.mimetype)) {
			cb(new Error('Only JPG, PNG, and WEBP files are allowed'), false);
		} else {
			cb(null, true);
		}
	},
});
