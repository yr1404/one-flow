const { validationResult } = require('express-validator');
const { SalesOrderItem, SalesOrder, Product } = require('../models');

function deriveSubtotal(quantity, product, explicit) {
  if (explicit != null) return explicit; // user provided
  if (!product) return null;
  const price = product.unitPrice || product.cost || 0;
  return Number(quantity || 1) * Number(price);
}

// POST /api/sales-order-items
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let { sales_order_id, product_id, quantity, sub_total } = req.body;
    if (sales_order_id == null || product_id == null) {
      return res.status(400).json({ message: 'sales_order_id and product_id are required' });
    }
    const so = await SalesOrder.findByPk(sales_order_id);
    if (!so) return res.status(400).json({ message: `sales_order_id ${sales_order_id} not found` });
    const product = await Product.findByPk(product_id);
    if (!product) return res.status(400).json({ message: `product_id ${product_id} not found` });
    quantity = quantity ?? 1;
    const computed = deriveSubtotal(quantity, product, sub_total);
    const item = await SalesOrderItem.create({ sales_order_id, product_id, quantity, sub_total: computed });
    res.status(201).json(item);
  } catch (err) { next(err); }
};

// GET /api/sales-order-items/:id
exports.getById = async (req, res, next) => {
  try {
    const item = await SalesOrderItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'SalesOrderItem not found' });
    res.json(item);
  } catch (err) { next(err); }
};

// PUT /api/sales-order-items/:id
exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const item = await SalesOrderItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'SalesOrderItem not found' });

    const { sales_order_id, product_id, quantity, sub_total } = req.body;

    let so, product;
    if (sales_order_id != null) {
      so = await SalesOrder.findByPk(sales_order_id);
      if (!so) return res.status(400).json({ message: `sales_order_id ${sales_order_id} not found` });
      item.sales_order_id = sales_order_id;
    }
    let productChanged = false; let quantityChanged = false;
    if (product_id != null) {
      product = await Product.findByPk(product_id);
      if (!product) return res.status(400).json({ message: `product_id ${product_id} not found` });
      item.product_id = product_id;
      productChanged = true;
    }
    if (quantity != null) {
      item.quantity = quantity;
      quantityChanged = true;
    }

    if (sub_total != null) {
      item.sub_total = sub_total;
    } else if (productChanged || quantityChanged) {
      const prod = product || await Product.findByPk(item.product_id);
      item.sub_total = deriveSubtotal(item.quantity, prod, null);
    }

    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};
