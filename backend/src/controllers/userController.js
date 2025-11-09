// filepath: backend/src/controllers/userController.js
const { User } = require('../models');

// GET /api/users
exports.list = async (req, res, next) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password_hash'] } });
    res.json(users);
  } catch (err) { next(err); }
};

// (Optional) GET /api/users/:id
exports.getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, { attributes: { exclude: ['password_hash'] } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// (Optional) PATCH hourly rate
exports.update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const allowed = ['name','role','hourly_rate'];
    const updates = {};
    for (const k of allowed) if (Object.prototype.hasOwnProperty.call(req.body, k)) updates[k] = req.body[k];
    await user.update(updates);
    res.json(user);
  } catch (err) { next(err); }
};
