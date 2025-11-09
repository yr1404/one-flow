// models/taskAssignee.js
// Join table linking Tasks to Users (assigned users)
const { DataTypes } = require('sequelize');
const sequelize = require('./db-sequelize');

const TaskAssignee = sequelize.define('TaskAssignee', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  task_id: { type: DataTypes.INTEGER, allowNull: false }, // FK -> Task.id
  user_id: { type: DataTypes.INTEGER, allowNull: false }, // FK -> User.id
}, {
  indexes: [
    { unique: true, fields: ['task_id', 'user_id'] },
  ],
});

module.exports = TaskAssignee;
