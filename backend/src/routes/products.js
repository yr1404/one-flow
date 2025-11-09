const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Create product
router.post(
  '/',
  auth.required,
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('unitPrice').optional().isNumeric().withMessage('unitPrice must be numeric'),
    body('quantityAvailable').optional().isInt({ min: 0 }).withMessage('quantityAvailable must be a non-negative integer'),
    body('tax').optional().isNumeric().withMessage('tax must be numeric'),
    body('cost').optional().isNumeric().withMessage('cost must be numeric'),
  ],
  validate,
  ctrl.create
);

// Update product
router.put(
  '/:id',
  auth.required,
  [
    body('name').optional().isString().trim().notEmpty().withMessage('name cannot be empty'),
    body('unitPrice').optional().isNumeric(),
    body('quantityAvailable').optional().isInt({ min: 0 }),
    body('tax').optional().isNumeric(),
    body('cost').optional().isNumeric(),
  ],
  validate,
  ctrl.update
);

// List products
router.get('/', auth.optional, ctrl.list);

// Get product by id
router.get('/:id', auth.optional, ctrl.getById);

module.exports = router;