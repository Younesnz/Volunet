const express = require('express');

const router = express.Router();

const { authenticate, adminOnly } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

// getReports can be filtered by query
// acceptable queries: status, category, after(time), before(time), userId, adminId, eventId

router.get('/', authenticate, adminOnly, reportController.getReports);
router.post('/', authenticate, reportController.addReport);
router.get('/:id', authenticate, adminOnly, reportController.getReportById);
router.put('/:id', authenticate, adminOnly, reportController.updateReportById);
router.delete(
  '/:id',
  authenticate,
  adminOnly,
  reportController.deleteReportById
);

module.exports = router;
