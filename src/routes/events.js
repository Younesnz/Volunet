const express = require('express');

const router = express.Router();

const eventController = require('../controllers/eventController');
/**
 * @swagger
 * tags:
 *  - name: Events API
 *    description: Endpoints for managing events
 */
/**
 * @swagger
 * /events:
 *  post:
 *    tags: [Events API]
 *    summary: Create a new event
 *    description: Create a new event in the database.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Event'
 *    responses:
 *      200:
 *        description: The created event
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Event'
 */
router.post('/', eventController.addEvent);
/**
 * @swagger
 * /events/{id}:
 *  get:
 *    tags: [Events API]
 *    summary: Get an event by ID
 *    description: Fetch a single event from the database by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the event to retrieve.
 *    responses:
 *      200:
 *        description: The event data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Event'
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
router.put('/:id', eventController.updateEventById);
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
router.delete('/:id', eventController.deleteEventById);

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
router.put('/:id/likes', eventController.updateLikes);
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
router.post('/:id/comments', eventController.addComment);
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
router.delete('/:id/comments/:commentId', eventController.deleteCommentById);
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
router.put('/:id/rating', eventController.updateRating);
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
router.post('/:id/users', eventController.addUserToEvent);
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
router.delete('/:id/users', eventController.deleteUserFromEvent);

module.exports = router;
