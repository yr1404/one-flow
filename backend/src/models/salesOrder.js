// models/salesOrder.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const SalesOrder = sequelize.define("SalesOrder", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderno: { type: DataTypes.STRING(50) },
  partnerId: { type: DataTypes.INTEGER }, // FK -> Partner.id
  projectId: { type: DataTypes.INTEGER }, // FK -> Project.id
  createdBy: { type: DataTypes.INTEGER, field: 'createtedBy' }, // FK -> User.id (DB column kept as provided)
  orderDate: { type: DataTypes.DATE },
  status: { type: DataTypes.STRING(50), defaultValue: "draft" },
  totalAmount: { type: DataTypes.DECIMAL(12,2) },
  tax: { type: DataTypes.DECIMAL(12,2) },
  note: { type: DataTypes.TEXT },
}, {
  timestamps: true,
  updatedAt: false,
});

module.exports = SalesOrder;
