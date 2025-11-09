// models/product.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  unitPrice: { type: DataTypes.DECIMAL(12,2) },
  quantityAvailable: { type: DataTypes.INTEGER },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  tax: { type: DataTypes.DECIMAL(5,2) },
  cost: { type: DataTypes.DECIMAL(12,2) },
}, {
  timestamps: true,
  updatedAt: false,
});

module.exports = Product;
