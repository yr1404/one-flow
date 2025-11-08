// models/salesOrder.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const SalesOrder = sequelize.define("SalesOrder", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  customer_id: { type: DataTypes.INTEGER }, // FK -> Customer.id
  project_id: { type: DataTypes.INTEGER }, // optional: project linked
  created_by: { type: DataTypes.INTEGER }, // FK -> User.id
  order_date: { type: DataTypes.DATE },
  delivery_date: { type: DataTypes.DATE },
  status: { type: DataTypes.STRING(50), defaultValue: "draft" },
  total_amount: { type: DataTypes.DECIMAL(12,2) },
  tax: { type: DataTypes.DECIMAL(12,2) },
  note: { type: DataTypes.TEXT },
});

module.exports = SalesOrder;
