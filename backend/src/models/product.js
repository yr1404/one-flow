// models/product.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const Product = sequelize.define("Product", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  unit_price: { type: DataTypes.DECIMAL(12,2) },
  unit: { type: DataTypes.STRING(50) },
  is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
  category: { type: DataTypes.STRING(100) },
});

module.exports = Product;
