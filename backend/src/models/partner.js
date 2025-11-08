// models/partner.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db-sequelize');

const Partner = sequelize.define('Partner', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  email: { type: DataTypes.STRING(255) },
  phone: { type: DataTypes.STRING(50) },
  address: { type: DataTypes.TEXT },
  role: { type: DataTypes.ENUM('vendor', 'customer'), allowNull: false },
  created_by: { type: DataTypes.INTEGER }, // FK -> User.id
});

module.exports = Partner;
