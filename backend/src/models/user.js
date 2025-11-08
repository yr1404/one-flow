// models/user.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password_hash: { type: DataTypes.TEXT },
  role: { type: DataTypes.STRING(50), defaultValue: "user" },
  // optionally other auth fields
});

module.exports = User;
