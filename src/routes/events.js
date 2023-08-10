const express = require('express');

const router = express.Router();

const eventController = require('../controllers/eventController');
const { authenticate, adminOnly } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *  - name: Events API
 *    description: Endpoints for managing events
 */

/**
 * @swagger
 * /api/v1/events/:
 *  post:
 *    tags: [Events API]
 *    summary: Add a new event
 *    description: Adds a new event to the database, generates an application, sets the organizer to the logged-in user, and adds the event id to created events of the user. Returns the submitted event and application.
 *    parameters:
 *    - in: header
 *      name: 'Auth'
 *      schema:
 *        type: string
 *      required: true
 *      description: The token of the authenticated user.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/AddEvent'
 *    responses:
 *      201:
 *        description: "Event added successfully"
 *      400:
 *        description: "Validation Error"
 *      401:
 *        description: "Unauthorized"
 *      500:
 *        description: "Internal Server Error"
 */
router.post('/', authenticate, eventController.addEvent);
/**
 * @swagger
 * /api/v1/events/{id}:
 *  get:
 *    tags: [Events API]
 *    summary: Retrieve an event by its ID
 *    description: Fetches the event's details using the provided event ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: 'string'
 *      required: true
 *      description: The ID of the event.
 *    responses:
 *      200:
 *        description: Successful operation
 *      404:
 *        description: Event not found
 *      500:
 *        description: Internal Server Error
 */
router.get('/:id', eventController.getEventById);
/**
 * @swagger
 * /events:
 *  get:
 *    tags: [Events API]
 *    summary: Get all events
 *    description: Fetch all events from the database.
 *    responses:
 *      200:
 *        description: An array of events
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Event'
 */
router.get('/', eventController.getEvents);
/**
 * @swagger
 * /events/{id}:
 *  put:
 *    tags: [Events API]
 *    summary: Update an event by ID
 *    description: Update a specific event in the database by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the event to update.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Event'
 *    responses:
 *      200:
 *        description: The updated event data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Event'
 */
router.put('/:id', authenticate, eventController.updateEventById);
/**
 * @swagger
 * /events/{id}:
 *  delete:
 *    tags: [Events API]
 *    summary: Delete an event by ID
 *    description: Delete a specific event from the database by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the event to delete.
 *    responses:
 *      200:
 *        description: The deleted event data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Event'
 */
router.delete('/:id', authenticate, adminOnly, eventController.deleteEventById);

/**
 * @swagger
 * /events/{id}/likes:
 *  put:
 *    tags: [Events API]
 *    summary: Update likes of an event
 *    description: Update likes of a specific event in the database by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the event to update likes.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              likes:
 *                type: number
 *    responses:
 *      200:
 *        description: The updated event data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Event'
 */
router.put('/:id/likes', authenticate, eventController.updateLikes);
/**
 * @swagger
 * /events/{id}/comments:
 *  post:
 *    tags: [Events API]
 *    summary: Add a comment to an event
 *    description: Add a comment to a specific event in the database by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the event to comment.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Comment'
 *    responses:
 *      200:
 *        description: The updated event data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Event'
 */
router.post('/:id/comments', authenticate, eventController.addComment);
/**
 * @swagger
 * /events/{id}/comments/{commentId}:
 *  delete:
 *    tags: [Events API]
 *    summary: Delete a specific comment from an event
 *    description: Delete a comment by its ID from a specific event in the database.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the event
 *    - in: path
 *      name: commentId
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the comment to delete
 *    responses:
 *      200:
 *        description: The updated event data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Event'
 */
router.delete(
  '/:eventId/comments/:commentId',
  authenticate,
  eventController.deleteCommentById
);
/**
 * @swagger
 * /events/{id}/rating:
 *  put:
 *    tags: [Events API]
 *    summary: Update the rating of an event
 *    description: Update the rating of a specific event in the database by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the event to update the rating.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              rating:
 *                type: number
 *                minimum: 0
 *                maximum: 5
 *    responses:
 *      200:
 *        description: The updated event data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Event'
 */
router.put('/:id/rating', authenticate, eventController.updateRating);
/**
 * @swagger
 * /events/{id}/users:
 *  post:
 *    tags: [Events API]
 *    summary: Add a user to an event
 *    description: Add a user to a specific event in the database by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the event
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              userId:
 *                type: string
 *                description: ID of the user to add
 *                example: '6151e94986fa7e6f6f006cdb'
 *    responses:
 *      200:
 *        description: The updated event data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Event'
 */
router.post('/:id/users', authenticate, eventController.addUserToEvent);
/**
 * @swagger
 * /events/{id}/users:
 *  delete:
 *    tags: [Events API]
 *    summary: Remove a user from an event
 *    description: Remove a user from a specific event in the database by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the event
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              userId:
 *                type: string
 *                description: ID of the user to remove
 *                example: '6151e94986fa7e6f6f006cdb'
 *    responses:
 *      200:
 *        description: The updated event data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Event'
 */
router.delete('/:id/users', authenticate, eventController.deleteUserFromEvent);

module.exports = router;
