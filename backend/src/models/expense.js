// models/expense.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const Expense = sequelize.define("Expense", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  project_id: { type: DataTypes.INTEGER }, // FK -> Project.id
  user_id: { type: DataTypes.INTEGER }, // FK -> User.id (who submitted)
  amount: { type: DataTypes.DECIMAL(12,2) },
  category: { type: DataTypes.STRING(100) },
  description: { type: DataTypes.TEXT },
  date: { type: DataTypes.DATE },
  status: { type: DataTypes.STRING(50), defaultValue: "pending" },
});

module.exports = Expense;
