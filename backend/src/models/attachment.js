// models/attachment.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const Attachment = sequelize.define("Attachment", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  task_id: { type: DataTypes.INTEGER }, // FK -> Task.id
  user_id: { type: DataTypes.INTEGER }, // FK -> User.id (uploader)
  file_name: { type: DataTypes.STRING(300) },
  file_url: { type: DataTypes.TEXT },
  attached_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

module.exports = Attachment;
