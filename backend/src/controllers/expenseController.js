const { validationResult } = require('express-validator');
const { Expense, Project, User } = require('../models');

// POST /api/expenses
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { project_id, user_id, amount, category, description, date, status, receiptUrl } = req.body;

    if (project_id) {
      const project = await Project.findByPk(project_id);
      if (!project) return res.status(400).json({ message: `project_id ${project_id} does not reference an existing project` });
    }
    let submitterId = user_id;
    if (!submitterId && req.user?.id) submitterId = req.user.id;
    if (submitterId) {
      const user = await User.findByPk(submitterId);
      if (!user) return res.status(400).json({ message: `user_id ${submitterId} does not reference an existing user` });
    }

    const exp = await Expense.create({ project_id, user_id: submitterId, amount, category, description, date, status, receiptUrl });
    res.status(201).json(exp);
  } catch (err) { next(err); }
};

// GET /api/expenses
exports.list = async (req, res, next) => {
  try {
    const { project_id, user_id, status } = req.query;
    const where = {};
    if (project_id) where.project_id = project_id;
    if (user_id) where.user_id = user_id;
    if (status) where.status = status;
    const expenses = await Expense.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(expenses);
  } catch (err) { next(err); }
};

// GET /api/expenses/:id
exports.getById = async (req, res, next) => {
  try {
    const exp = await Expense.findByPk(req.params.id);
    if (!exp) return res.status(404).json({ message: 'Expense not found' });
    res.json(exp);
  } catch (err) { next(err); }
};

// PUT /api/expenses/:id
exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const exp = await Expense.findByPk(req.params.id);
    if (!exp) return res.status(404).json({ message: 'Expense not found' });

    const allowed = ['project_id','user_id','amount','category','description','date','status','receiptUrl'];
    const updates = {};
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];

    if (updates.project_id) {
      const project = await Project.findByPk(updates.project_id);
      if (!project) return res.status(400).json({ message: `project_id ${updates.project_id} does not reference an existing project` });
    }
    if (updates.user_id) {
      const user = await User.findByPk(updates.user_id);
      if (!user) return res.status(400).json({ message: `user_id ${updates.user_id} does not reference an existing user` });
    }

    await exp.update(updates);
    res.json(exp);
  } catch (err) { next(err); }
};
