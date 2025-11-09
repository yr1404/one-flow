const { validationResult } = require('express-validator');
const { Product } = require('../models');

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, unitPrice, quantityAvailable, tax, cost } = req.body;
    const product = await Product.create({ name, unitPrice, quantityAvailable, tax, cost });
    res.status(201).json(product);
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const allowed = ['name','unitPrice','quantityAvailable','tax','cost'];
    const updates = {};
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(req.body, key)) updates[key] = req.body[key];

    await product.update(updates);
    res.json(product);
  } catch (err) { next(err); }
};
