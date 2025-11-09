const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/taskController');
const auth = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// Create Task
router.post(
  '/',
  auth.required,
  [
    body('title').trim().notEmpty().withMessage('title is required'),
    body('project_id').optional().isInt().withMessage('project_id must be an integer'),
    body('created_by').optional().isInt().withMessage('created_by must be an integer'),
    body('status').optional().isString(),
    body('priority').optional().isString(),
    body('estimated_hours').optional().isInt({ min: 0 }).withMessage('estimated_hours must be a non-negative integer'),
    body('deadline').optional().isISO8601().toDate(),
  ],
  validate,
  ctrl.create
);

// Update Task (partial)
router.put(
  '/:id',
  auth.required,
  [
    body('title').optional().isString().trim().notEmpty().withMessage('title cannot be empty'),
    body('project_id').optional().isInt(),
    body('created_by').optional().isInt(),
    body('status').optional().isString(),
    body('priority').optional().isString(),
    body('estimated_hours').optional().isInt({ min: 0 }),
    body('deadline').optional().isISO8601().toDate(),
  ],
  validate,
  ctrl.update
);

// Get single Task
router.get('/:id', auth.optional, ctrl.getById);

// Get users assigned to a task
router.get('/:id/assignees', auth.optional, async (req, res, next) => {
  try {
    const { Task, User } = require('../models');
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: User, as: 'assignees', through: { attributes: [] } }]
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task.assignees || []);
  } catch (err) { next(err); }
});

// Delete Task
router.delete('/:id', auth.required, ctrl.remove);

module.exports = router;