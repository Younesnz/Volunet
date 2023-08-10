const express = require('express');

const router = express.Router();

const { authenticate, adminOnly } = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

/**
 * @swagger
 * tags:
 *  - name: Applications API
 *    description: Endpoints for managing applications
 */

/**
 * @swagger
 * /applications/{id}:
 *  get:
 *    tags: [Applications API]
 *    summary: Get an application by ID
 *    description: Fetch a single application from the database by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the application to retrieve.
 *    responses:
 *      200:
 *        description: The application data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Application'
 */
router.get('/:id', authenticate, applicationController.getAppById);
/**
 * @swagger
 * /applications:
 *  get:
 *    tags: [Applications API]
 *    summary: Retrieve a list of applications
 *    description: Retrieve a list of applications from the database.
 *    responses:
 *      200:
 *        description: A list of applications.
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Application'
 */
router.get('/', authenticate, adminOnly, applicationController.getApps);
/**
 * @swagger
 * /applications/{id}:
 *  put:
 *    tags: [Applications API]
 *    summary: Update an application by ID
 *    description: Update a specific application in the database by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the application to update.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Application'
 *    responses:
 *      200:
 *        description: The updated application data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Application'
 */
router.put(
  '/:id',
  authenticate,
  adminOnly,
  applicationController.updateAppById
);

// we don't need to delete applications as they will be deleted when an event is deleted
// router.delete('/:id', applicationController.deleteAppById);

module.exports = router;
