// models/timeEntry.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const TimeEntry = sequelize.define("TimeEntry", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER }, // FK -> User.id
  task_id: { type: DataTypes.INTEGER }, // FK -> Task.id
  date: { type: DataTypes.DATEONLY },
  hours: { type: DataTypes.FLOAT, defaultValue: 0 },
  description: { type: DataTypes.TEXT },
  billable: { type: DataTypes.BOOLEAN, defaultValue: false },
});

module.exports = TimeEntry;
