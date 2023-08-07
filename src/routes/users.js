const router = require('express').Router();
const userController = require('../controllers/userController');
const { authenticate, adminOnly } = require('../middleware/auth');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Authenticated routes
router.get('/profile', authenticate, userController.getUserProfile);
router.put('/profile', authenticate, userController.updateUserProfile);

// Notification routes
router.get('/notifications', authenticate, userController.getUserNotifications);
router.post(
  '/:id/notifications',
  authenticate,
  adminOnly,
  userController.createNotification
);
router.delete(
  '/:userId/notifications/:notifId',
  authenticate,
  adminOnly,
  userController.deleteNotification
);

// Admin only routes
router.get('/', authenticate, adminOnly, userController.getUsers);
router.get('/:id', authenticate, adminOnly, userController.getUserProfile);
router.put('/:id', authenticate, adminOnly, userController.updateUserProfile);
router.delete('/:id', authenticate, adminOnly, userController.deleteUserById);

module.exports = router;
