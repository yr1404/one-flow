const express = require('express');
const { body, query } = require('express-validator');
const ctrl = require('../controllers/partnerController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Create partner (vendor or customer)
router.post(
  '/',
  auth.required,
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('role').isIn(['vendor','customer']).withMessage('role must be vendor or customer'),
    body('email').optional().isEmail().withMessage('invalid email'),
    body('phone').optional().isString().isLength({ max: 50 }),
    body('address').optional().isString(),
  ],
  validate,
  ctrl.create
);

// List partners (optional role filter)
router.get(
  '/',
  auth.optional,
  [
    query('role').optional().isIn(['vendor','customer']).withMessage('role filter must be vendor or customer'),
  ],
  validate,
  ctrl.list
);

// Get partner by id
router.get('/:id', auth.optional, ctrl.getById);

module.exports = router;
