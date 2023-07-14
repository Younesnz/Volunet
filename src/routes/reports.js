const express = require('express');

const router = express.Router();

const reportController = require('../controllers/reportController');

// getReports can be filtered by query
// acceptable queries: status, category, after(time), before(time), userId, adminId, eventId
router.get('/', reportController.getReports);
router.post('/', reportController.addReport);
router.get('/:id', reportController.getReportById);
router.put('/:id', reportController.updateReportById);
router.delete('/:id', reportController.deleteReportById);

module.exports = router;
