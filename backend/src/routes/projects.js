const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Create project
router.post(
  '/',
  auth.required,
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('manager_id').optional().isInt().withMessage('manager_id must be an integer'),
    body('start_date').optional().isISO8601().toDate(),
    body('deadline').optional().isISO8601().toDate(),
    body('status').optional().isString(),
    body('priority').optional().isString(),
    body('budget').optional().isNumeric().withMessage('budget must be numeric'),
    body('tag').optional().isString().isLength({ max: 100 }),
    body('image_url').optional().isURL().isLength({ max: 255 }),
  ],
  validate,
  ctrl.create
);


router.get('/', auth.optional, ctrl.list);
router.get('/:id', auth.optional, ctrl.getById);

module.exports = router;
