require('dotenv').config();
const sequelize = require('../models/db-sequelize');

async function connectDB({ sync = true } = {}) {
  await sequelize.authenticate();
  if (sync) {
    const mode = process.env.DB_SYNC_MODE || (process.env.NODE_ENV === 'production' ? 'normal' : 'alter'); // normal | alter | force
    if (mode === 'alter') {
      await sequelize.sync({ alter: true });
      console.log('DB synced (alter)');
    } else if (mode === 'force') {
      await sequelize.sync({ force: true });
      console.log('DB synced (force)');
    } else {
      await sequelize.sync();
      console.log('DB synced');
    }
  }
  console.log('Database connected');
  return sequelize;
}

module.exports = {
  sequelize,
  connectDB,
};
