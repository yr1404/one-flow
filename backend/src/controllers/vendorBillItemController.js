const { validationResult } = require('express-validator');
const { VendorBill, VendorBillItem, Product } = require('../models');

// POST /api/vendor-bill-items
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { vendor_bill_id, product_id } = req.body;

    const vb = await VendorBill.findByPk(vendor_bill_id);
    if (!vb) return res.status(400).json({ message: `vendor_bill_id ${vendor_bill_id} does not reference an existing vendor bill` });

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(400).json({ message: `product_id ${product_id} does not reference an existing product` });

    const item = await VendorBillItem.create({ vendor_bill_id, product_id });
    res.status(201).json(item);
  } catch (err) { next(err); }
};

// GET /api/vendor-bill-items
exports.list = async (req, res, next) => {
  try {
    const { vendor_bill_id } = req.query;
    const where = {};
    if (vendor_bill_id) where.vendor_bill_id = vendor_bill_id;
    const items = await VendorBillItem.findAll({ where, order: [['id', 'DESC']] });
    res.json(items);
  } catch (err) { next(err); }
};

// GET /api/vendor-bill-items/:id
exports.getById = async (req, res, next) => {
  try {
    const item = await VendorBillItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'VendorBillItem not found' });
    res.json(item);
  } catch (err) { next(err); }
};

// PUT /api/vendor-bill-items/:id
exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const item = await VendorBillItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'VendorBillItem not found' });

    const allowed = ['vendor_bill_id','product_id'];
    const updates = {};
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];

    if (updates.vendor_bill_id) {
      const vb = await VendorBill.findByPk(updates.vendor_bill_id);
      if (!vb) return res.status(400).json({ message: `vendor_bill_id ${updates.vendor_bill_id} does not reference an existing vendor bill` });
    }
    if (updates.product_id) {
      const product = await Product.findByPk(updates.product_id);
      if (!product) return res.status(400).json({ message: `product_id ${updates.product_id} does not reference an existing product` });
    }

    await item.update(updates);
    res.json(item);
  } catch (err) { next(err); }
};
