const express = require('express');

const router = express.Router();

const applicationController = require('../controllers/applicationController');

// this is for testing and should be removed later, applications will be created when a new event submitted
router.post('/', applicationController.testAddApp);
router.get('/:id', applicationController.getAppById);
router.get('/', applicationController.getApps);
router.put('/:id', applicationController.updateAppById);
router.delete('/:id', applicationController.deleteAppById);

module.exports = router;
