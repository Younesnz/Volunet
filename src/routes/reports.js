const express = require('express');

const router = express.Router();

// const UserController = require('../controllers/reportController');

// This is just for testing
router.get('/', (req, res) => res.json({ success: true }));

module.exports = router;
