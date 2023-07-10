const express = require('express');

const router = express.Router();

const UserController = require('../controllers/reportController');

// getReports can be filtered by query
// acceptable queries: status, category, after(time), before(time), userId, adminId, eventId
router.get('/', UserController.getReports);
router.post('/', UserController.addReport);
module.exports = router;
