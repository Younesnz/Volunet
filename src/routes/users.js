const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken'); // add this line
const userController = require('../controllers/userController');
const { authenticate, adminOnly } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *  - name: Users API
 *    description: Endpoints for managing users
 */

/**
 * @swagger
 * /users/register:
 *  post:
 *    tags: [Users API]
 *    summary: Register a new user
 *    description: Register a new user in the database.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: The created user data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
router.post('/register', userController.registerUser);
/**
 * @swagger
 * /users/login:
 *  post:
 *    tags: [Users API]
 *    summary: Log in an existing user
 *    description: Log in an existing user and return a token.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: The token
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 */
router.post('/login', userController.loginUser);

// Authenticated routes
/**
 * @swagger
 * /users/profile/{id}:
 *  get:
 *    tags: [Users API]
 *    summary: Get a user's profile
 *    description: Get a specific user's profile by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the user to retrieve.
 *    responses:
 *      200:
 *        description: The user's profile data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
router.get('/profile/:id', authenticate, userController.getUserProfile);
/**
 * @swagger
 * /users/profile/{id}:
 *  put:
 *    tags: [Users API]
 *    summary: Update a user's profile
 *    description: Update a specific user's profile by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the user to update.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: The updated user's profile data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
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
/**
 * @swagger
 * /users:
 *  get:
 *    tags: [Users API]
 *    summary: Get all users
 *    description: Retrieve all users from the database (Admin only).
 *    responses:
 *      200:
 *        description: A list of users
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/User'
 */
router.get('/', authenticate, adminOnly, userController.getUsers);
/**
 * @swagger
 * /users/{id}:
 *  get:
 *    tags: [Users API]
 *    summary: Get a user by ID
 *    description: Get a specific user from the database by ID (Admin only).
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the user to retrieve.
 *    responses:
 *      200:
 *        description: The user data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
router.get('/:id', authenticate, adminOnly, userController.getUserById);
/**
 * @swagger
 * /users/{id}:
 *  put:
 *    tags: [Users API]
 *    summary: Update a user by ID
 *    description: Update a specific user in the database by ID (Admin only).
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the user to update.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: The updated user data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
router.put('/:id', authenticate, adminOnly, userController.updateUserById);
/**
 * @swagger
 * /users/{id}:
 *  delete:
 *    tags: [Users API]
 *    summary: Delete a user by ID
 *    description: Delete a specific user from the database by ID (Admin only).
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the user to delete.
 *    responses:
 *      200:
 *        description: The deleted user data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 */
router.delete('/:id', authenticate, adminOnly, userController.deleteUserById);

module.exports = router;
