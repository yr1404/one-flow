const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/signup',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
    body('role').optional().isIn(['manager','team_member','finance','admin']).withMessage('Invalid role'),
  ],
  ctrl.signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  ctrl.login
);

router.get('/me', auth.required, ctrl.me);

module.exports = router;