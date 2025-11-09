// models/vendorBillItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('./db-sequelize');

const VendorBillList = sequelize.define('VendorBillList', {
 
  vendor_bill_id: { type: DataTypes.INTEGER, allowNull: false }, // FK -> VendorBill.id
  product_id: { type: DataTypes.INTEGER, allowNull: false }, // FK -> Product.id
  
});

module.exports = VendorBillList;
