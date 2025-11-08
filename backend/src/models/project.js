// models/project.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const Project = sequelize.define("Project", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  manager_id: { type: DataTypes.INTEGER }, // FK -> User.id
  start_date: { type: DataTypes.DATE },
  deadline: { type: DataTypes.DATE },
  status: { type: DataTypes.STRING(50), defaultValue: "planned" },
  priority: { type: DataTypes.STRING(30) },
  budget: { type: DataTypes.DECIMAL(12,2) },
});

module.exports = Project;
