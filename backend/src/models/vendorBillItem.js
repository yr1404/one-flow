// models/vendorBillItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db-sequelize');

// Canonical vendor bill item model; includes quantity & sub_total for extensibility.
const VendorBillItem = sequelize.define('VendorBillItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  vendor_bill_id: { type: DataTypes.INTEGER, allowNull: false }, // FK -> VendorBill.id
  product_id: { type: DataTypes.INTEGER, allowNull: false }, // FK -> Product.id
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  sub_total: { type: DataTypes.DECIMAL(12,2) },
}, {
  timestamps: false,
});

module.exports = VendorBillItem;
