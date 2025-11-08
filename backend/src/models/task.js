// models/task.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const Task = sequelize.define("Task", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  project_id: { type: DataTypes.INTEGER }, // FK -> Project.id
  assigned_to: { type: DataTypes.INTEGER }, // FK -> User.id
  created_by: { type: DataTypes.INTEGER }, // FK -> User.id
  status: { type: DataTypes.STRING(50), defaultValue: "todo" },
  priority: { type: DataTypes.STRING(30) },
  estimated_hours: { type: DataTypes.INTEGER },
  deadline: { type: DataTypes.DATE },
});
module.exports = Task;
