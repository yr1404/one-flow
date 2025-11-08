// models/purchaseOrderItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const PurchaseOrderItem = sequelize.define("PurchaseOrderItem", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  purchase_order_id: { type: DataTypes.INTEGER }, // FK -> PurchaseOrder.id
  product_id: { type: DataTypes.INTEGER }, // FK -> Product.id
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  unit_price: { type: DataTypes.DECIMAL(12,2) },
  sub_total: { type: DataTypes.DECIMAL(12,2) },
}, {
  timestamps: false
});

module.exports = PurchaseOrderItem;
