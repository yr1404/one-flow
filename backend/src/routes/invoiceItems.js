const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/invoiceItemController');

const router = express.Router();

// POST /api/invoice-items
router.post('/',
  body('invoice_id').isInt().withMessage('invoice_id must be an integer'),
  body('product_id').isInt().withMessage('product_id must be an integer'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('sub_total').optional().isDecimal().withMessage('sub_total must be decimal'),
  ctrl.create
);

// GET /api/invoice-items/:id
router.get('/:id',
  param('id').isInt().withMessage('id must be an integer'),
  ctrl.getById
);

// PUT /api/invoice-items/:id
router.put('/:id',
  param('id').isInt().withMessage('id must be an integer'),
  body('invoice_id').optional().isInt().withMessage('invoice_id must be an integer'),
  body('product_id').optional().isInt().withMessage('product_id must be an integer'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('sub_total').optional().isDecimal().withMessage('sub_total must be decimal'),
  ctrl.update
);

module.exports = router;
