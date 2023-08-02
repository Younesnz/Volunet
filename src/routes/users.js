const router = require('express').Router();
const passport = require('passport');
const userController = require('../controllers/userController');
const { authenticate, adminOnly } = require('../middleware/auth');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Authenticated routes
router.get('/profile/:id', authenticate, userController.getUserProfile);
router.put('/profile/:id', authenticate, userController.updateUserProfile);

// Google OAuth routes
router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

// Admin only routes
router.get('/', authenticate, adminOnly, userController.getUsers);
router.get('/:id', authenticate, adminOnly, userController.getUserById);
router.put('/:id', authenticate, adminOnly, userController.updateUserById);
router.delete('/:id', authenticate, adminOnly, userController.deleteUserById);

module.exports = router;
