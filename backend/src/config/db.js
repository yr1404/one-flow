// models/db-sequelize.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.PGDATABASE || "postgres",
  process.env.DB_USER || process.env.PGUSER || "postgres",
  process.env.DB_PASS || process.env.PGPASSWORD || "",
  {
    host: process.env.DB_HOST || process.env.PGHOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : (process.env.PGPORT ? Number(process.env.PGPORT) : 5432),
    dialect: "postgres",
    logging: false, // set true for SQL logs
    define: {
      underscored: true,
      timestamps: true,
    },
  }
);

module.exports = sequelize;
