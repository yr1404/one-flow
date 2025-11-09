const { validationResult } = require('express-validator');
const { Task, User, TaskAssignee } = require('../models');

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      title,
      description,
      project_id,
      created_by,
      status,
      priority,
      estimated_hours,
      deadline,
    } = req.body;

    // If created_by not supplied, use authenticated user if present
    let creatorId = created_by;
    if (!creatorId && req.user && req.user.id) creatorId = req.user.id;

    if (creatorId) {
      const creator = await User.findByPk(creatorId);
      if (!creator) return res.status(400).json({ message: `created_by ${creatorId} does not reference an existing user` });
    }

    const task = await Task.create({
      title,
      description,
      project_id,
      created_by: creatorId,
      status,
      priority,
      estimated_hours,
      deadline,
    });

    res.status(201).json(task);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = req.params.id;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const allowed = ['title','description','project_id','created_by','status','priority','estimated_hours','deadline'];
    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];
    }

    if (updates.created_by) {
      const creator = await User.findByPk(updates.created_by);
      if (!creator) return res.status(400).json({ message: `created_by ${updates.created_by} does not reference an existing user` });
    }

    await task.update(updates);
    res.json(task);
  } catch (err) { next(err); }
};

exports.listByProject = async (req, res, next) => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const tasks = await Task.findAll({ where: { project_id: projectId } });
    res.json(tasks);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const id = req.params.id;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
};
