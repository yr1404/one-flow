const { validationResult } = require('express-validator');
const { Project } = require('../models');


exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      name,
      description,
      manager_id,
      start_date,
      deadline,
      status,
      priority,
      budget,
      tag,
      image_url,
    } = req.body;

    // Debug log to verify incoming body
    console.log('[ProjectController] create body:', {
      name,
      description,
      manager_id,
      start_date,
      deadline,
      status,
      priority,
      budget,
      tag,
      image_url,
    });

    // Auto-assign manager_id if not provided explicitly and user is authenticated
    let effectiveManagerId = manager_id;
    if (!effectiveManagerId && req.user && req.user.id) {
      effectiveManagerId = req.user.id;
    }

    // (Optional) verify manager exists if manager_id supplied
    if (effectiveManagerId) {
      const { User } = require('../models');
      const managerExists = await User.findByPk(effectiveManagerId);
      if (!managerExists) {
        return res.status(400).json({ message: `manager_id ${effectiveManagerId} does not reference an existing user` });
      }
    }

    const created = await Project.create({
      name,
      description,
      manager_id: effectiveManagerId,
      start_date,
      deadline,
      status,
      priority,
      budget,
      tag,
      image_url,
    });

    // If tag or image_url still null, surface a warning in logs
    if (!created.tag || !created.image_url) {
      console.warn('[ProjectController] Warning: tag or image_url persisted as null', { persistedTag: created.tag, persistedImageUrl: created.image_url });
    }

    res.status(201).json(created);
  } catch (err) {
    // Provide clearer messaging on FK constraint violations
    if (err.name === 'SequelizeForeignKeyConstraintError' && /manager_id/.test(err.message)) {
      return res.status(400).json({ message: 'Invalid manager_id: user does not exist' });
    }
    next(err);
  }
};


exports.list = async (req, res, next) => {
  try {
    const projects = await Project.findAll();
    res.json(projects);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { next(err); }
};

// Update an existing project (partial update)
exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = req.params.id;
    const project = await Project.findByPk(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const allowed = [
      'name',
      'description',
      'manager_id',
      'start_date',
      'deadline',
      'status',
      'priority',
      'budget',
      'tag',
      'image_url',
    ];

    const updates = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updates[key] = req.body[key];
      }
    }

    // If manager_id provided, validate existence
    if (updates.manager_id) {
      const { User } = require('../models');
      const manager = await User.findByPk(updates.manager_id);
      if (!manager) {
        return res.status(400).json({ message: `manager_id ${updates.manager_id} does not reference an existing user` });
      }
    }

    await project.update(updates);
    res.json(project);
  } catch (err) {
    if (err.name === 'SequelizeForeignKeyConstraintError' && /manager_id/.test(err.message)) {
      return res.status(400).json({ message: 'Invalid manager_id: user does not exist' });
    }
    next(err);
  }
};
