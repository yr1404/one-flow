// models/invoiceItem.js
// Standardized invoice line item model (renamed from legacy InvoiceList)
const { DataTypes } = require('sequelize');
const sequelize = require('./db-sequelize');

const InvoiceItem = sequelize.define('InvoiceItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  invoice_id: { type: DataTypes.INTEGER, allowNull: false }, // FK -> Invoice.id
  product_id: { type: DataTypes.INTEGER, allowNull: false }, // FK -> Product.id
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  sub_total: { type: DataTypes.DECIMAL(12,2) },
}, {
  timestamps: false,
});

module.exports = InvoiceItem;
