import asyncHandler from 'express-async-handler';

export const paginate = (model, filter = {}, options = {}) =>
  asyncHandler(async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      model
        .find(filter)
        .select(options.select || '')
        .populate(options.populate || '')
        .skip(skip)
        .limit(limit)
        .sort(options.sort || { createdAt: -1 }),
      model.countDocuments(filter),
    ]);

    res.json({
      data: docs,
      pagination: { page, total, totalPages: Math.ceil(total / limit) },
    });
  });