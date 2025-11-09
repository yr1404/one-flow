const express = require('express');
const { body, param } = require('express-validator');
const ctrl = require('../controllers/taskAssigneeController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Assign user to task
router.post(
  '/',
  auth.required,
  [
    body('task_id').isInt().withMessage('task_id is required and must be int'),
    body('user_id').isInt().withMessage('user_id is required and must be int'),
  ],
  validate,
  ctrl.create
);

// List assignments for a task (by task id in path)
router.get(
  '/task/:taskId',
  auth.optional,
  [ param('taskId').isInt().withMessage('taskId must be int') ],
  validate,
  ctrl.listByTask
);

// Remove assignment (task_id + user_id in body)
router.delete(
  '/',
  auth.required,
  [
    body('task_id').isInt().withMessage('task_id is required and must be int'),
    body('user_id').isInt().withMessage('user_id is required and must be int'),
  ],
  validate,
  ctrl.delete
);

// Count tasks assigned to a user
router.get('/user/:userId/count', auth.optional, ctrl.countByUser);

module.exports = router;