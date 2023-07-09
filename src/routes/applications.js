const router = require('express').Router();
const auth = require('./auth');  // assuming you have an auth middleware to authenticate users
const applicationController = require('./applicationController');
//user need authentication 
router.get('/:id', applicationController.getApplication);
//admin  
router.get('/', applicationController.getApplications);
router.put('/:id', applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

module.exports=router;