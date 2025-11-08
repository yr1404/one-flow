const jwt = require('jsonwebtoken');
const { User } = require('../models');

const getTokenFromHeader = (req) => {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
};

exports.required = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const secret = process.env.JWT_SECRET || 'change_this_secret';
    const decoded = jwt.verify(token, secret);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    req.user = { id: user.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.optional = (req, res, next) => {
  const token = getTokenFromHeader(req);
  if (!token) return next();
  try {
    const secret = process.env.JWT_SECRET || 'change_this_secret';
    const decoded = jwt.verify(token, secret);
    req.user = { id: decoded.id };
  } catch (e) {
    // ignore invalid token for optional
  }
  next();
};