// models/comment.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const Comment = sequelize.define("Comment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  task_id: { type: DataTypes.INTEGER }, // FK -> Task.id
  user_id: { type: DataTypes.INTEGER }, // FK -> User.id
  content: { type: DataTypes.TEXT, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false
});

module.exports = Comment;
