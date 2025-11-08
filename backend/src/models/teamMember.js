// models/teamMember.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const TeamMember = sequelize.define("TeamMember", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  team_id: { type: DataTypes.INTEGER }, // FK -> Team.id
  user_id: { type: DataTypes.INTEGER }, // FK -> User.id
  role: { type: DataTypes.STRING(100) },
  joined_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false
});

module.exports = TeamMember;
