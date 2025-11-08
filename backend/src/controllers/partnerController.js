const { validationResult } = require('express-validator');
const { Partner } = require('../models');

// POST /api/partners
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, phone, address, role } = req.body;

    const created = await Partner.create({
      name,
      email,
      phone,
      address,
      role,
      created_by: req.user?.id || null,
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

// GET /api/partners
exports.list = async (req, res, next) => {
  try {
    const { role } = req.query; // optional filter
    const where = {};
    if (role) where.role = role;

    const partners = await Partner.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(partners);
  } catch (err) {
    next(err);
  }
};

// GET /api/partners/:id
exports.getById = async (req, res, next) => {
  try {
    const partner = await Partner.findByPk(req.params.id);
    if (!partner) return res.status(404).json({ message: 'Partner not found' });
    res.json(partner);
  } catch (err) {
    next(err);
  }
};
