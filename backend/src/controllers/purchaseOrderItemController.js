const { validationResult } = require('express-validator');
const { PurchaseOrderItem, PurchaseOrder, Product } = require('../models');

// Helper to derive subtotal if not provided
function calcSubTotal(quantity, product) {
  if (!product || quantity == null) return null;
  const price = product.unitPrice || product.cost || 0;
  return (quantity * price).toFixed(2);
}

// POST /api/purchase-order-items
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { purchase_order_id, product_id, quantity, sub_total } = req.body;

    // Validate purchase order
    const po = await PurchaseOrder.findByPk(purchase_order_id);
    if (!po) return res.status(400).json({ message: `purchase_order_id ${purchase_order_id} does not reference an existing purchase order` });

    // Validate product
    const product = await Product.findByPk(product_id);
    if (!product) return res.status(400).json({ message: `product_id ${product_id} does not reference an existing product` });

    let computedSubtotal = sub_total;
    if (computedSubtotal == null) {
      const s = calcSubTotal(quantity, product);
      if (s != null) computedSubtotal = s;
    }

    const item = await PurchaseOrderItem.create({ purchase_order_id, product_id, quantity, sub_total: computedSubtotal });
    res.status(201).json(item);
  } catch (err) { next(err); }
};

// GET /api/purchase-order-items/:id
exports.getById = async (req, res, next) => {
  try {
    const item = await PurchaseOrderItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'PurchaseOrderItem not found' });
    res.json(item);
  } catch (err) { next(err); }
};

// PUT /api/purchase-order-items/:id
exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const item = await PurchaseOrderItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'PurchaseOrderItem not found' });

    const allowed = ['purchase_order_id','product_id','quantity','sub_total'];
    const updates = {};
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];

    if (updates.purchase_order_id) {
      const po = await PurchaseOrder.findByPk(updates.purchase_order_id);
      if (!po) return res.status(400).json({ message: `purchase_order_id ${updates.purchase_order_id} does not reference an existing purchase order` });
    }
    let product;
    if (updates.product_id) {
      product = await Product.findByPk(updates.product_id);
      if (!product) return res.status(400).json({ message: `product_id ${updates.product_id} does not reference an existing product` });
    } else if (updates.quantity && !updates.sub_total) {
      // Need existing product to recompute subtotal
      product = await Product.findByPk(item.product_id);
    }

    // Auto compute sub_total if quantity or product changed and sub_total not explicitly provided
    if (!updates.sub_total && (updates.quantity || updates.product_id)) {
      const q = updates.quantity != null ? updates.quantity : item.quantity;
      const prod = product || await Product.findByPk(item.product_id);
      const s = calcSubTotal(q, prod);
      if (s != null) updates.sub_total = s;
    }

    await item.update(updates);
    res.json(item);
  } catch (err) { next(err); }
};
