// models/salesOrderItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const SalesOrderItem = sequelize.define("SalesOrderItem", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  sales_order_id: { type: DataTypes.INTEGER }, // FK -> SalesOrder.id
  product_id: { type: DataTypes.INTEGER }, // FK -> Product.id
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  sub_total: { type: DataTypes.DECIMAL(12,2) },
}, {
  timestamps: false
});

module.exports = SalesOrderItem;
