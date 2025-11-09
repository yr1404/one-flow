// models/vendor.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const Vendor = sequelize.define("Vendor", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  email: { type: DataTypes.STRING(255) },
  phone: { type: DataTypes.STRING(50) },
  address: { type: DataTypes.TEXT },
  created_by: { type: DataTypes.INTEGER }, // FK -> User.id
});

module.exports = Vendor;
