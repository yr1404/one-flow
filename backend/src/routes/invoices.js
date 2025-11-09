const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/invoiceController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Create Invoice
router.post(
  '/',
  auth.required,
  [
    body('sales_order_id').isInt().withMessage('sales_order_id is required and must be int'),
    body('created_by').optional().isInt().withMessage('created_by must be int'),
    body('status').optional().isString(),
    body('amount').optional().isNumeric().withMessage('amount must be numeric'),
  ],
  validate,
  ctrl.create
);

// Update Invoice
router.put(
  '/:id',
  auth.required,
  [
    body('sales_order_id').optional().isInt(),
    body('created_by').optional().isInt(),
    body('status').optional().isString(),
    body('amount').optional().isNumeric(),
  ],
  validate,
  ctrl.update
);

// List invoices
router.get('/', auth.optional, ctrl.list);

// Get invoice by id
router.get('/:id', auth.optional, ctrl.getById);

module.exports = router;