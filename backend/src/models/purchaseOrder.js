// models/purchaseOrder.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const PurchaseOrder = sequelize.define("PurchaseOrder", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  vendor_id: { type: DataTypes.INTEGER }, // FK -> Partner.id (role='vendor')
  project_id: { type: DataTypes.INTEGER }, // FK -> Project.id
  created_by: { type: DataTypes.INTEGER }, // FK -> User.id
  expected_delivery: { type: DataTypes.DATE },
  status: { type: DataTypes.STRING(50), defaultValue: "draft" },
  total_amount: { type: DataTypes.DECIMAL(12,2) },
  tax: { type: DataTypes.DECIMAL(12,2) },
  note: { type: DataTypes.TEXT },
});

module.exports = PurchaseOrder;
