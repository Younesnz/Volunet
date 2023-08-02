const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken'); // add this line
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
    // User has been authenticated by Google and user has been set on req by Passport

    // JWT for user
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET);

    // Send JWT back to client. Client stores this to send it in later requests
    res.status(200).json({ token, user: req.user });
  }
);

// Admin only routes
router.get('/', authenticate, adminOnly, userController.getUsers);
router.get('/:id', authenticate, adminOnly, userController.getUserById);
router.put('/:id', authenticate, adminOnly, userController.updateUserById);
router.delete('/:id', authenticate, adminOnly, userController.deleteUserById);

module.exports = router;
