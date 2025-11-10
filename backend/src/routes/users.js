// filepath: backend/src/routes/users.js
const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', auth.required, ctrl.list);
router.get('/:id', auth.required, ctrl.getById);
router.patch('/:id', auth.required, [
  body('name').optional().isString(),
  body('role').optional().isString(),
  body('hourly_rate').optional().isNumeric(),
  body('image_url').optional().isURL().withMessage('image_url must be a valid URL'),
], validate, ctrl.update);

module.exports = router;
