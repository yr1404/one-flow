// models/team.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db-sequelize");

const Team = sequelize.define("Team", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT },
});

module.exports = Team;
