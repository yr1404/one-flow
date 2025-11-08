const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const apiRoutes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const { sequelize } = require('./config/db'); 

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// DB 
app.get('/db-health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ db: true });
  } catch (err) {
    console.error('DB health check failed', err);
    res.status(500).json({ db: false, error: err.message });
  }
});

// Mount all feature routes under /api
app.use('/api', apiRoutes);

// 404 and Error handlers
const { notFound, errorHandler } = require('./middleware/error');
app.use(notFound);
app.use(errorHandler);

module.exports = app;