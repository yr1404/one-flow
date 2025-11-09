const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/purchaseOrderController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Create Purchase Order
router.post(
  '/',
  auth.required,
  [
    body('vendor_id').optional().isInt().withMessage('vendor_id must be int'),
    body('project_id').optional().isInt().withMessage('project_id must be int'),
    body('created_by').optional().isInt().withMessage('created_by must be int'),
    body('expected_delivery').optional().isISO8601().toDate(),
    body('status').optional().isString(),
    body('total_amount').optional().isNumeric().withMessage('total_amount must be numeric'),
    body('tax').optional().isNumeric().withMessage('tax must be numeric'),
    body('note').optional().isString(),
  ],
  validate,
  ctrl.create
);

// Update Purchase Order
router.put(
  '/:id',
  auth.required,
  [
    body('vendor_id').optional().isInt(),
    body('project_id').optional().isInt(),
    body('created_by').optional().isInt(),
    body('expected_delivery').optional().isISO8601().toDate(),
    body('status').optional().isString(),
    body('total_amount').optional().isNumeric(),
    body('tax').optional().isNumeric(),
    body('note').optional().isString(),
  ],
  validate,
  ctrl.update
);

// List all
router.get('/', auth.optional, ctrl.list);

// Get by id
router.get('/:id', auth.optional, ctrl.getById);

module.exports = router;