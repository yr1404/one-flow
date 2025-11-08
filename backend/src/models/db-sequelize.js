// Sequelize initialization
// This file creates and exports a singleton Sequelize instance used by all models.
// It prefers standard Postgres env vars (PG*) but allows DB_* overrides.
// Ensure you have at least PGDATABASE / PGUSER / PGPASSWORD / PGHOST / PGPORT or their DB_* equivalents.
require('dotenv').config();
const { Sequelize } = require('sequelize');

// Build config from env
const database = process.env.DB_NAME || process.env.PGDATABASE || 'postgres';
const username = process.env.DB_USER || process.env.PGUSER || 'postgres';
const password = process.env.DB_PASS || process.env.PGPASSWORD || '';
const host = process.env.DB_HOST || process.env.PGHOST || 'localhost';
const port = Number(process.env.DB_PORT || process.env.PGPORT || 5432);

const sequelize = new Sequelize(database, username, password, {
	host,
	port,
	dialect: 'postgres',
	logging: false, // set to console.log for debugging SQL
	define: {
		underscored: true,
		timestamps: true,
	},
	pool: {
		max: 10,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
});

module.exports = sequelize;

