const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const authRoutes=require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const db = require('./config/db'); // <-- new

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// DB health check
app.get('/db-health', async (req, res) => {
  try {
    const result = await db.query('SELECT 1 AS ok');
    res.json({ db: result.rows[0].ok === 1 });
  } catch (err) {
    console.error('DB health check failed', err);
    res.status(500).json({ db: false, error: err.message });
  }
});

if (authRoutes) app.use('/api/auth', authRoutes);

module.exports = app;