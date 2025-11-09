const { validationResult } = require('express-validator');
const { PurchaseOrder, Partner, Project, User } = require('../models');

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      vendor_id,
      project_id,
      created_by,
      expected_delivery,
      status,
      total_amount,
      tax,
      note,
    } = req.body;

    // created_by defaults to authenticated user if available
    let creatorId = created_by;
    if (!creatorId && req.user && req.user.id) creatorId = req.user.id;

    // Validate FKs
    if (vendor_id) {
      const vendor = await Partner.findByPk(vendor_id);
      if (!vendor) return res.status(400).json({ message: `vendor_id ${vendor_id} does not reference an existing partner` });
      if (vendor.role && vendor.role !== 'vendor') return res.status(400).json({ message: `partner ${vendor_id} is not a vendor (role=${vendor.role})` });
    }
    if (project_id) {
      const project = await Project.findByPk(project_id);
      if (!project) return res.status(400).json({ message: `project_id ${project_id} does not reference an existing project` });
    }
    if (creatorId) {
      const creator = await User.findByPk(creatorId);
      if (!creator) return res.status(400).json({ message: `created_by ${creatorId} does not reference an existing user` });
    }

    const po = await PurchaseOrder.create({
      vendor_id,
      project_id,
      created_by: creatorId,
      expected_delivery,
      status,
      total_amount,
      tax,
      note,
    });

    res.status(201).json(po);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const pos = await PurchaseOrder.findAll();
    res.json(pos);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'PurchaseOrder not found' });
    res.json(po);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ message: 'PurchaseOrder not found' });

    const allowed = ['vendor_id','project_id','created_by','expected_delivery','status','total_amount','tax','note'];
    const updates = {};
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];

    // Validate FKs if present in updates
    if (updates.vendor_id) {
      const vendor = await Partner.findByPk(updates.vendor_id);
      if (!vendor) return res.status(400).json({ message: `vendor_id ${updates.vendor_id} does not reference an existing partner` });
      if (vendor.role && vendor.role !== 'vendor') return res.status(400).json({ message: `partner ${updates.vendor_id} is not a vendor (role=${vendor.role})` });
    }
    if (updates.project_id) {
      const project = await Project.findByPk(updates.project_id);
      if (!project) return res.status(400).json({ message: `project_id ${updates.project_id} does not reference an existing project` });
    }
    if (updates.created_by) {
      const creator = await User.findByPk(updates.created_by);
      if (!creator) return res.status(400).json({ message: `created_by ${updates.created_by} does not reference an existing user` });
    }

    await po.update(updates);
    res.json(po);
  } catch (err) { next(err); }
};
