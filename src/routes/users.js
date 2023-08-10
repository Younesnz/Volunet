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
 * /api/v1/users/register:
 *  post:
 *    tags: [Users API]
 *    summary: Register a new user
 *    description: Register a new user in the database.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RegisterUser'
 *    responses:
 *      201:
 *        description: "User registered successfully"
 *      400:
 *        description: "Validation Error"
 *      500:
 *        description: "Internal Server Error"
 */
router.post('/register', userController.registerUser);
/**
 * @swagger
 * /api/v1/users/login:
 *  post:
 *    tags: [Users API]
 *    summary: Log in an existing user
 *    description: Log in an existing user and return a token.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/LoginUser'
 *    responses:
 *      201:
 *        description: "User logged in successfully"
 *      401:
 *        description: "Invalid email or password"
 *      500:
 *        description: "Internal Server Error"
 */
router.post('/login', userController.loginUser);

// Authenticated routes
/**
 * @swagger
 * /api/v1/users/profile:
 *  get:
 *    tags: [Users API]
 *    summary: Get user profile
 *    description: Fetch the user's profile based on the provided authentication token.
 *    parameters:
 *    - in: header
 *      name: 'Auth'
 *      schema:
 *        type: string
 *      required: true
 *      description: The token of the logged in user.
 *    responses:
 *      200:
 *        description: Successful operation
 *      400:
 *        description: Invalid input or user id
 *      403:
 *        description: Access denied
 *      404:
 *        description: User not found
 *      500:
 *        description: Internal Server Error
 */
router.get('/profile', authenticate, userController.getUserProfile);
/**
 * @swagger
 * /api/v1/users/profile:
 *  put:
 *    tags: [Users API]
 *    summary: Update user profile
 *    description: Update the authenticated user's profile details based on the provided fields and authentication token.
 *    parameters:
 *    - in: header
 *      name: 'Auth'
 *      schema:
 *        type: string
 *      required: true
 *      description: The token of the logged in user.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/updateUserProfile'
 *    responses:
 *      200:
 *        description: User profile updated successfully
 *      400:
 *        description: Validation error
 *      403:
 *        description: Access denied
 *      404:
 *        description: User not found
 *      500:
 *        description: Internal Server Error
 */
router.put('/profile', authenticate, userController.updateUserProfile);

// Notification routes
/**
 * @swagger
 * /api/v1/users/notifications:
 *  get:
 *    tags: [Users API]
 *    summary: Get user notification
 *    description: Fetch the user's notification based on the provided authentication token.
 *    parameters:
 *    - in: header
 *      name: 'Auth'
 *      schema:
 *        type: string
 *      required: true
 *      description: The token of the logged in user.
 *    responses:
 *      200:
 *        description: Successful operation
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: User not found
 *      500:
 *        description: Internal Server Error
 */
router.get('/notifications', authenticate, userController.getUserNotifications);

/**
 * @swagger
 * /api/v1/users/{user id}/notifications:
 *  post:
 *    tags: [Users API]
 *    summary: Add user notification
 *    description: Add notification to the user.
 *    parameters:
 *    - in: header
 *      name: 'Auth'
 *      schema:
 *        type: string
 *      required: true
 *      description: The token of the logged in user.
 *    - in: path
 *      name: user id
 *      required: true
 *      schema:
 *        type: string
 *      description: The user id
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/userNotification'
 *    responses:
 *      200:
 *        description: Notification added
 *      404:
 *        description: User not found
 */
router.post(
  '/:id/notifications',
  authenticate,
  adminOnly,
  userController.createNotification
);
/**
 * @swagger
 * /api/v1/users/{user id}/notifications/{notification id}:
 *  delete:
 *    tags: [Users API]
 *    summary: Delete user notification
 *    description: Delete notification of a user.
 *    parameters:
 *    - in: header
 *      name: 'Auth'
 *      schema:
 *        type: string
 *      required: true
 *      description: The token of the logged in user.
 *    - in: path
 *      name: user id
 *      required: true
 *      schema:
 *        type: string
 *      description: The user id
 *    - in: path
 *      name: notification id
 *      required: true
 *      schema:
 *        type: string
 *      description: The notification id
 *    responses:
 *      200:
 *        description: Notification deleted
 *      404:
 *        description: User not found
 */
router.delete(
  '/:userId/notifications/:notifId',
  authenticate,
  adminOnly,
  userController.deleteNotification
);

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
 * /api/v1/users/{user id}/notifications:
 *  post:
 *    tags: [Users API]
 *    summary: Add user notification
 *    description: Add notification to the user.
 *    parameters:
 *    - in: header
 *      name: 'Auth'
 *      schema:
 *        type: string
 *      required: true
 *      description: The token of the logged in user.
 *    - in: path
 *      name: user id
 *      required: true
 *      schema:
 *        type: string
 *      description: The user id
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/userNotification'
 *    responses:
 *      200:
 *        description: Successful operation
 *      400:
 *        description: Invalid user ID
 *      403:
 *        description: Access denied
 *      404:
 *        description: User not found
 *      500:
 *        description: Internal Server Error
 */

/**
 * @swagger
 * /api/v1/users:
 *  get:
 *    tags: [Users API]
 *    summary: Get users
 *    description: It’s only for Amins. It will return a list of users matched with the filter query. The filter query can be empty (it will return the first 50 users in the database)
 *    parameters:
 *
 *    - in: header
 *      name: 'Auth'
 *      schema:
 *        type: string
 *      required: true
 *      description: The token of the admin user.
 *
 *    - in: query
 *      name: username
 *      schema:
 *        type: string
 *      description: it will search for a username (no need to be an exact username, it can be part of it)
 *
 *    - in: query
 *      name: email
 *      schema:
 *        type: string
 *      description: it will search in emails
 *
 *    - in: query
 *      name: name
 *      schema:
 *        type: string
 *      description: it will search in both first_name and last_name fields
 *
 *    - in: query
 *      name: olderThan
 *      schema:
 *        type: integer
 *        minimum: 0
 *        maximum: 100
 *      description: Will filter users older than this age
 *
 *    - in: query
 *      name: youngerThan
 *      schema:
 *        type: integer
 *        minimum: 0
 *        maximum: 100
 *      description: Will filter users younger than this age
 *
 *    - in: query
 *      name: joinedBefore
 *      schema:
 *        type: string
 *        format: date
 *      description: Will filter users who joined before this date
 *
 *    - in: query
 *      name: joinedAfter
 *      schema:
 *        type: string
 *        format: date
 *      description: Will filter users who joined after this date
 *
 *    - in: query
 *      name: isVerified
 *      schema:
 *        type: boolean
 *      description: Boolean filter
 *
 *    - in: query
 *      name: role
 *      schema:
 *        type: string
 *        enum: [admin, user, organization]
 *      description: only accepts ‘admin’, ‘user’ or ‘organization’
 *
 *    - in: query
 *      name: country
 *      schema:
 *        type: string
 *
 *    - in: query
 *      name: city
 *      schema:
 *        type: string
 *
 *    - in: query
 *      name: hasRated
 *      schema:
 *        type: string
 *        format: objectId
 *      description: filters the users who have rated a specific event
 *
 *    - in: query
 *      name: hasLiked
 *      schema:
 *        type: string
 *        format: objectId
 *      description: filters the users who have liked a specific event
 *
 *    - in: query
 *      name: hasJoined
 *      schema:
 *        type: string
 *        format: objectId
 *      description: filters the users who have joined a specific event
 *
 *    - in: query
 *      name: limit
 *      schema:
 *        type: integer
 *        minimum: 1
 *        maximum: 100
 *      description: It will limit the number of results (by default it’s 50)
 *
 *    responses:
 *      201:
 *        description: "User logged in successfully"
 *      401:
 *        description: "Invalid email or password"
 *      500:
 *        description: "Internal Server Error"
 */
router.get('/', authenticate, adminOnly, userController.getUsers);

router.get('/:id', authenticate, adminOnly, userController.getUserProfile);
router.put('/:id', authenticate, adminOnly, userController.updateUserProfile);
/**
 * @swagger
 * /api/v1/users/{id}:
 *  delete:
 *    tags: [Users API]
 *    summary: Delete user by ID
 *    description: Delete a user by its unique ID. Requires authentication and admin privileges.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: The ID of the user to be deleted.
 *    - in: header
 *      name: 'Auth'
 *      schema:
 *        type: string
 *      required: true
 *      description: The token of the authenticated admin.
 *    responses:
 *      200:
 *        description: Successful operation
 *      400:
 *        description: Invalid user ID
 *      403:
 *        description: Access denied
 *      404:
 *        description: User not found
 *      500:
 *        description: Internal Server Error
 */
router.delete('/:id', authenticate, adminOnly, userController.deleteUserById);

module.exports = router;
