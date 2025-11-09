const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/timeEntryController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Create Time Entry
router.post(
  '/',
  auth.required,
  [
    body('user_id').optional().isInt().withMessage('user_id must be int'),
    body('task_id').isInt().withMessage('task_id is required and must be int'),
    body('date').optional().isISO8601().toDate(),
    body('hours').optional().isFloat({ min: 0 }).withMessage('hours must be a non-negative number'),
    body('description').optional().isString(),
  ],
  validate,
  ctrl.create
);

// Update Time Entry
router.put(
  '/:id',
  auth.required,
  [
    body('user_id').optional().isInt(),
    body('task_id').optional().isInt(),
    body('date').optional().isISO8601().toDate(),
    body('hours').optional().isFloat({ min: 0 }),
    body('description').optional().isString(),
  ],
  validate,
  ctrl.update
);

// List all
router.get('/', auth.optional, ctrl.list);

// Get by id
router.get('/:id', auth.optional, ctrl.getById);

module.exports = router;
