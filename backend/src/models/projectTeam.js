// models/projectTeam.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const ProjectTeam = sequelize.define("ProjectTeam", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  team_id: { type: DataTypes.INTEGER }, // FK -> Team.id
  project_id: { type: DataTypes.INTEGER }, // FK -> Project.id
  assigned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false
});

module.exports = ProjectTeam;
