const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/salesOrderController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Create Sales Order
router.post(
  '/',
  auth.required,
  [
    body('orderno').optional().isString(),
    body('partnerId').optional().isInt().withMessage('partnerId must be int'),
    body('projectId').optional().isInt().withMessage('projectId must be int'),
    body('createdBy').optional().isInt().withMessage('createdBy must be int'),
    body('orderDate').optional().isISO8601().toDate(),
    body('status').optional().isString(),
    body('totalAmount').optional().isNumeric(),
    body('tax').optional().isNumeric(),
    body('note').optional().isString(),
  ],
  validate,
  ctrl.create
);

// Update Sales Order
router.put(
  '/:id',
  auth.required,
  [
    body('orderno').optional().isString(),
    body('partnerId').optional().isInt(),
    body('projectId').optional().isInt(),
    body('createdBy').optional().isInt(),
    body('orderDate').optional().isISO8601().toDate(),
    body('status').optional().isString(),
    body('totalAmount').optional().isNumeric(),
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