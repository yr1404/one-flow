const { validationResult } = require('express-validator');
const { SalesOrder, Partner, Project, User } = require('../models');

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      orderno,
      partnerId,
      projectId,
      createdBy,
      orderDate,
      status,
      totalAmount,
      tax,
      note,
    } = req.body;

    let creatorId = createdBy;
    if (!creatorId && req.user && req.user.id) creatorId = req.user.id;

    if (partnerId) {
      const partner = await Partner.findByPk(partnerId);
      if (!partner) return res.status(400).json({ message: `partnerId ${partnerId} does not reference an existing partner` });
    }
    if (projectId) {
      const project = await Project.findByPk(projectId);
      if (!project) return res.status(400).json({ message: `projectId ${projectId} does not reference an existing project` });
    }
    if (creatorId) {
      const creator = await User.findByPk(creatorId);
      if (!creator) return res.status(400).json({ message: `createdBy ${creatorId} does not reference an existing user` });
    }

    const so = await SalesOrder.create({
      orderno,
      partnerId,
      projectId,
      createdBy: creatorId,
      orderDate,
      status,
      totalAmount,
      tax,
      note,
    });

    res.status(201).json(so);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const salesOrders = await SalesOrder.findAll();
    res.json(salesOrders);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const so = await SalesOrder.findByPk(req.params.id);
    if (!so) return res.status(404).json({ message: 'SalesOrder not found' });
    res.json(so);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const so = await SalesOrder.findByPk(req.params.id);
    if (!so) return res.status(404).json({ message: 'SalesOrder not found' });

    const allowed = ['orderno','partnerId','projectId','createdBy','orderDate','status','totalAmount','tax','note'];
    const updates = {};
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];

    if (updates.partnerId) {
      const partner = await Partner.findByPk(updates.partnerId);
      if (!partner) return res.status(400).json({ message: `partnerId ${updates.partnerId} does not reference an existing partner` });
    }
    if (updates.projectId) {
      const project = await Project.findByPk(updates.projectId);
      if (!project) return res.status(400).json({ message: `projectId ${updates.projectId} does not reference an existing project` });
    }
    if (updates.createdBy) {
      const creator = await User.findByPk(updates.createdBy);
      if (!creator) return res.status(400).json({ message: `createdBy ${updates.createdBy} does not reference an existing user` });
    }

    await so.update(updates);
    res.json(so);
  } catch (err) { next(err); }
};
