// models/invoice.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db-sequelize');

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  sales_order_id: { type: DataTypes.INTEGER, allowNull: false }, // FK -> SalesOrder.id
 
  status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'pending' },
  amount: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
});

module.exports = Invoice;
