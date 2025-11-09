const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

function signToken(user) {
    const payload = { id: user.id };
    const secret = process.env.JWT_SECRET || 'change_this_secret';
    const opts = { expiresIn: process.env.JWT_EXPIRES_IN || '1d' };
    return jwt.sign(payload, secret, opts);
}

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const role = ['manager','team_member','finance','admin'].includes(req.body.role) ? req.body.role : 'team_member';
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const user = await User.create({ name, email, password, role });
    const token = signToken(user);
    const userSafe = user.toJSON ? user.toJSON() : user;
    delete userSafe.password_hash;
    res.status(201).json({ token, user: userSafe });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
   
    const user = await User.scope('withHash').findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    const userSafe = user.toJSON ? user.toJSON() : user;
    delete userSafe.password_hash;
    res.json({ token, user: userSafe });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
   
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password_hash'] } });
    res.json(user);
  } catch (err) {
    next(err);
  }
};