const { validationResult } = require('express-validator');
const { VendorBill, Partner, PurchaseOrder } = require('../models');

// POST /api/vendor-bills
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { vendor_id, purchase_order_id, status, amount } = req.body;

    // Validate FK: vendor exists and has role 'vendor' if role is present
    const vendor = await Partner.findByPk(vendor_id);
    if (!vendor) return res.status(400).json({ message: `vendor_id ${vendor_id} does not reference an existing partner` });
    if (vendor.role && vendor.role !== 'vendor') return res.status(400).json({ message: `partner ${vendor_id} is not a vendor (role=${vendor.role})` });

    // Validate FK: purchase order exists
    const po = await PurchaseOrder.findByPk(purchase_order_id);
    if (!po) return res.status(400).json({ message: `purchase_order_id ${purchase_order_id} does not reference an existing purchase order` });

    const vb = await VendorBill.create({ vendor_id, purchase_order_id, status, amount });
    res.status(201).json(vb);
  } catch (err) {
    next(err);
  }
};

// GET /api/vendor-bills
exports.list = async (req, res, next) => {
  try {
    const bills = await VendorBill.findAll({ order: [['createdAt', 'DESC']] });
    res.json(bills);
  } catch (err) { next(err); }
};

// GET /api/vendor-bills/:id
exports.getById = async (req, res, next) => {
  try {
    const vb = await VendorBill.findByPk(req.params.id);
    if (!vb) return res.status(404).json({ message: 'VendorBill not found' });
    res.json(vb);
  } catch (err) { next(err); }
};

// PUT /api/vendor-bills/:id
exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const vb = await VendorBill.findByPk(req.params.id);
    if (!vb) return res.status(404).json({ message: 'VendorBill not found' });

    const allowed = ['vendor_id','purchase_order_id','status','amount'];
    const updates = {};
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];

    if (updates.vendor_id) {
      const vendor = await Partner.findByPk(updates.vendor_id);
      if (!vendor) return res.status(400).json({ message: `vendor_id ${updates.vendor_id} does not reference an existing partner` });
      if (vendor.role && vendor.role !== 'vendor') return res.status(400).json({ message: `partner ${updates.vendor_id} is not a vendor (role=${vendor.role})` });
    }
    if (updates.purchase_order_id) {
      const po = await PurchaseOrder.findByPk(updates.purchase_order_id);
      if (!po) return res.status(400).json({ message: `purchase_order_id ${updates.purchase_order_id} does not reference an existing purchase order` });
    }

    await vb.update(updates);
    res.json(vb);
  } catch (err) { next(err); }
};
