const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/purchaseOrderItemController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Create Purchase Order Item
router.post(
  '/',
  auth.required,
  [
    body('purchase_order_id').isInt().withMessage('purchase_order_id is required and must be int'),
    body('product_id').isInt().withMessage('product_id is required and must be int'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be >= 1'),
    body('sub_total').optional().isNumeric().withMessage('sub_total must be numeric'),
  ],
  validate,
  ctrl.create
);

// Update Purchase Order Item
router.put(
  '/:id',
  auth.required,
  [
    body('purchase_order_id').optional().isInt(),
    body('product_id').optional().isInt(),
    body('quantity').optional().isInt({ min: 1 }),
    body('sub_total').optional().isNumeric(),
  ],
  validate,
  ctrl.update
);

// Get by id
router.get('/:id', auth.optional, ctrl.getById);

module.exports = router;
