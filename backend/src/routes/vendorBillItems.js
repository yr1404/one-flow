const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/vendorBillItemController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Create Vendor Bill Item
router.post(
  '/',
  auth.required,
  [
    body('vendor_bill_id').isInt().withMessage('vendor_bill_id is required and must be int'),
    body('product_id').isInt().withMessage('product_id is required and must be int'),
  ],
  validate,
  ctrl.create
);

// Update Vendor Bill Item
router.put(
  '/:id',
  auth.required,
  [
    param('id').isInt(),
    body('vendor_bill_id').optional().isInt(),
    body('product_id').optional().isInt(),
  ],
  validate,
  ctrl.update
);

// List Vendor Bill Items (optional filter by vendor_bill_id)
router.get('/', auth.optional, ctrl.list);

// Get by id
router.get('/:id', auth.optional, ctrl.getById);

module.exports = router;
