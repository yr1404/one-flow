const { validationResult } = require('express-validator');
const { TimeEntry, Task, User } = require('../models');

// POST /api/time-entries
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { user_id, task_id, date, hours, description } = req.body;

    // Resolve user (default to auth user if user_id not provided)
    let uid = user_id;
    if (!uid && req.user?.id) uid = req.user.id;
    if (uid) {
      const user = await User.findByPk(uid);
      if (!user) return res.status(400).json({ message: `user_id ${uid} does not reference an existing user` });
    }
    if (task_id) {
      const task = await Task.findByPk(task_id);
      if (!task) return res.status(400).json({ message: `task_id ${task_id} does not reference an existing task` });
    }

    const entry = await TimeEntry.create({ user_id: uid, task_id, date, hours, description });
    res.status(201).json(entry);
  } catch (err) { next(err); }
};

// GET /api/time-entries
exports.list = async (req, res, next) => {
  try {
    const { user_id, task_id, from, to } = req.query;
    const where = {};
    if (user_id) where.user_id = user_id;
    if (task_id) where.task_id = task_id;
    if (from || to) {
      where.date = {};
      if (from) where.date.$gte = from; // naive; user may enhance later
      if (to) where.date.$lte = to;
    }
    const entries = await TimeEntry.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(entries);
  } catch (err) { next(err); }
};

// GET /api/time-entries/:id
exports.getById = async (req, res, next) => {
  try {
    const entry = await TimeEntry.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: 'TimeEntry not found' });
    res.json(entry);
  } catch (err) { next(err); }
};

// PUT /api/time-entries/:id
exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const entry = await TimeEntry.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: 'TimeEntry not found' });

    const allowed = ['user_id','task_id','date','hours','description'];
    const updates = {};
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];

    if (updates.user_id) {
      const user = await User.findByPk(updates.user_id);
      if (!user) return res.status(400).json({ message: `user_id ${updates.user_id} does not reference an existing user` });
    }
    if (updates.task_id) {
      const task = await Task.findByPk(updates.task_id);
      if (!task) return res.status(400).json({ message: `task_id ${updates.task_id} does not reference an existing task` });
    }

    await entry.update(updates);
    res.json(entry);
  } catch (err) { next(err); }
};
