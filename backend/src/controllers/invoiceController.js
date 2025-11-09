const { validationResult } = require('express-validator');
const { Invoice, SalesOrder, User } = require('../models');

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { sales_order_id, created_by, status, amount } = req.body;

    // Validate FKs
    const so = await SalesOrder.findByPk(sales_order_id);
    if (!so) return res.status(400).json({ message: `sales_order_id ${sales_order_id} does not reference an existing sales order` });

    let creatorId = created_by;
    if (!creatorId && req.user && req.user.id) creatorId = req.user.id;
    if (creatorId) {
      const user = await User.findByPk(creatorId);
      if (!user) return res.status(400).json({ message: `created_by ${creatorId} does not reference an existing user` });
    }

    const invoice = await Invoice.create({ sales_order_id, created_by: creatorId, status, amount });
    res.status(201).json(invoice);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const invoices = await Invoice.findAll();
    res.json(invoices);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const allowed = ['sales_order_id','created_by','status','amount'];
    const updates = {};
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];

    if (updates.sales_order_id) {
      const so = await SalesOrder.findByPk(updates.sales_order_id);
      if (!so) return res.status(400).json({ message: `sales_order_id ${updates.sales_order_id} does not reference an existing sales order` });
    }
    if (updates.created_by) {
      const user = await User.findByPk(updates.created_by);
      if (!user) return res.status(400).json({ message: `created_by ${updates.created_by} does not reference an existing user` });
    }

    await invoice.update(updates);
    res.json(invoice);
  } catch (err) { next(err); }
};
