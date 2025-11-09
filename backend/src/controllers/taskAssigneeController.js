const { validationResult } = require('express-validator');
const { TaskAssignee, Task, User, sequelize } = require('../models');

// Create assignment (assign user to task)
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { task_id, user_id } = req.body;

    // Validate existence of task and user
    const [task, user] = await Promise.all([
      Task.findByPk(task_id),
      User.findByPk(user_id),
    ]);
    if (!task) return res.status(400).json({ message: `task_id ${task_id} does not reference an existing task` });
    if (!user) return res.status(400).json({ message: `user_id ${user_id} does not reference an existing user` });

    // Check for existing assignment
    const existing = await TaskAssignee.findOne({ where: { task_id, user_id } });
    if (existing) return res.status(409).json({ message: 'Assignment already exists' });

    const assignment = await TaskAssignee.create({ task_id, user_id });
    res.status(201).json(assignment);
  } catch (err) { next(err); }
};

// List assignees for a task (returns TaskAssignee rows)
exports.listByTask = async (req, res, next) => {
  try {
    const taskId = req.params.taskId || req.params.id;
    const rows = await TaskAssignee.findAll({ where: { task_id: taskId } });
    res.json(rows);
  } catch (err) { next(err); }
};

// Delete assignment (by pair)
exports.delete = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { task_id, user_id } = req.body;
    const existing = await TaskAssignee.findOne({ where: { task_id, user_id } });
    if (!existing) return res.status(404).json({ message: 'Assignment not found' });
    await existing.destroy();
    res.json({ message: 'Assignment removed' });
  } catch (err) { next(err); }
};

// Count tasks assigned to a given user
exports.countByUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (Number.isNaN(userId)) return res.status(400).json({ message: 'Invalid userId' });

  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { count } = await TaskAssignee.findAndCountAll({ where: { user_id: userId } });
  res.json({ user_id: userId, name: user.name, task_count: count });
  } catch (err) { next(err); }
};
