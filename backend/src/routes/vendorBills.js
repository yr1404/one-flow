const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/vendorBillController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Create Vendor Bill
router.post(
  '/',
  auth.required,
  [
    body('vendor_id').isInt().withMessage('vendor_id is required and must be int'),
    body('purchase_order_id').isInt().withMessage('purchase_order_id is required and must be int'),
    body('status').optional().isString(),
    body('amount').optional().isNumeric(),
  ],
  validate,
  ctrl.create
);

// Update Vendor Bill
router.put(
  '/:id',
  auth.required,
  [
    body('vendor_id').optional().isInt(),
    body('purchase_order_id').optional().isInt(),
    body('status').optional().isString(),
    body('amount').optional().isNumeric(),
  ],
  validate,
  ctrl.update
);

// List all
router.get('/', auth.optional, ctrl.list);

// Get by id
router.get('/:id', auth.optional, ctrl.getById);

module.exports = router;
