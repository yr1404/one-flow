// models/vendorBill.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db-sequelize');

const VendorBill = sequelize.define('VendorBill', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  vendor_id: { type: DataTypes.INTEGER, allowNull: false }, // FK -> Partner.id (role: vendor)
  purchase_order_id: { type: DataTypes.INTEGER, allowNull: false }, // FK -> PurchaseOrder.id
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  amount: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
},
{
  timestamps: false // we manually manage createdAt only
});

module.exports = VendorBill;
