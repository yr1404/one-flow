const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/expenseController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Create Expense
router.post(
  '/',
  auth.required,
  [
    body('project_id').optional().isInt().withMessage('project_id must be int'),
    body('user_id').optional().isInt().withMessage('user_id must be int'),
    body('amount').isNumeric().withMessage('amount is required and must be numeric'),
    body('category').optional().isString(),
    body('description').optional().isString(),
    body('date').optional().isISO8601().toDate(),
    body('status').optional().isString(),
    body('receiptUrl').optional().isURL().withMessage('receiptUrl must be a valid URL'),
  ],
  validate,
  ctrl.create
);

// Update Expense
router.put(
  '/:id',
  auth.required,
  [
    body('project_id').optional().isInt(),
    body('user_id').optional().isInt(),
    body('amount').optional().isNumeric(),
    body('category').optional().isString(),
    body('description').optional().isString(),
    body('date').optional().isISO8601().toDate(),
    body('status').optional().isString(),
    body('receiptUrl').optional().isURL(),
  ],
  validate,
  ctrl.update
);

// List all
router.get('/', auth.optional, ctrl.list);

// Get by id
router.get('/:id', auth.optional, ctrl.getById);

module.exports = router;
