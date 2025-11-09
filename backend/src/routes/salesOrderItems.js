const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/salesOrderItemController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Create Sales Order Item
router.post(
  '/',
  auth.required,
  [
    body('sales_order_id').isInt({ gt: 0 }).withMessage('sales_order_id must be a positive integer'),
    body('product_id').isInt({ gt: 0 }).withMessage('product_id must be a positive integer'),
    body('quantity').optional().isInt({ gt: 0 }),
    body('sub_total').optional().isFloat({ gt: 0 }),
  ],
  validate,
  ctrl.create
);

// Update Sales Order Item
router.put(
  '/:id',
  auth.required,
  [
    param('id').isInt({ gt: 0 }),
    body('sales_order_id').optional().isInt({ gt: 0 }),
    body('product_id').optional().isInt({ gt: 0 }),
    body('quantity').optional().isInt({ gt: 0 }),
    body('sub_total').optional().isFloat({ gt: 0 }),
  ],
  validate,
  ctrl.update
);

// Get by id
router.get(
  '/:id',
  [param('id').isInt({ gt: 0 })],
  validate,
  ctrl.getById
);

module.exports = router;
