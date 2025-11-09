const { validationResult } = require('express-validator');
const { InvoiceItem, Invoice, Product } = require('../models');

function computeSubtotal(quantity, product, explicit) {
  if (explicit != null) return explicit;
  if (!product) return null;
  const price = product.unitPrice || product.cost || 0; // support different naming
  return Number(quantity || 1) * Number(price);
}

// POST /api/invoice-items
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let { invoice_id, product_id, quantity, sub_total } = req.body;
    if (invoice_id == null || product_id == null) {
      return res.status(400).json({ message: 'invoice_id and product_id are required' });
    }
    const invoice = await Invoice.findByPk(invoice_id);
    if (!invoice) return res.status(400).json({ message: `invoice_id ${invoice_id} not found` });
    const product = await Product.findByPk(product_id);
    if (!product) return res.status(400).json({ message: `product_id ${product_id} not found` });
    quantity = quantity ?? 1;
    const subtotal = computeSubtotal(quantity, product, sub_total);
    const item = await InvoiceItem.create({ invoice_id, product_id, quantity, sub_total: subtotal });
    res.status(201).json(item);
  } catch (err) { next(err); }
};

// GET /api/invoice-items/:id
exports.getById = async (req, res, next) => {
  try {
    const item = await InvoiceItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'InvoiceItem not found' });
    res.json(item);
  } catch (err) { next(err); }
};

// PUT /api/invoice-items/:id
exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const item = await InvoiceItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'InvoiceItem not found' });

    const { invoice_id, product_id, quantity, sub_total } = req.body;

    let invoice, product;
    let invoiceChanged = false; let productChanged = false; let quantityChanged = false;
    if (invoice_id != null) {
      invoice = await Invoice.findByPk(invoice_id);
      if (!invoice) return res.status(400).json({ message: `invoice_id ${invoice_id} not found` });
      item.invoice_id = invoice_id;
      invoiceChanged = true;
    }
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
      item.sub_total = computeSubtotal(item.quantity, prod, null);
    }

    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};
