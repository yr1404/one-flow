const express = require('express');

const router = express.Router();

// Feature routes
router.use('/auth', require('./auth'));
router.use('/projects', require('./projects'));
router.use('/partners', require('./partners'));

module.exports = router;
