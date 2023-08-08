const express = require('express');

const router = express.Router();

const { authenticate, adminOnly } = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

router.get('/:id', authenticate, applicationController.getAppById);
router.get('/', authenticate, adminOnly, applicationController.getApps);
router.put(
  '/:id',
  authenticate,
  adminOnly,
  applicationController.updateAppById
);

// we don't need to delete applications as they will be deleted when an event is deleted
// router.delete('/:id', applicationController.deleteAppById);

module.exports = router;
