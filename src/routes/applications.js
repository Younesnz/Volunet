const express = require('express');

const router = express.Router();

const applicationController = require('../controllers/applicationController');

// this is for testing and should be removed later, applications will be created when a new event submitted
/**
 * @swagger
 * tags:
 *  - name: Applications API
 *    description: Endpoints for managing applications
 */
/**
 * @swagger
 * /applications:
 *  post:
 *    tags: [Applications API]
 *    summary: Create a new application
 *    description: Create a new application in the database.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Application'
 *    responses:
 *      200:
 *        description: The created application
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Application'
 */
router.post('/', applicationController.testAddApp);
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
router.get('/:id', applicationController.getAppById);
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
router.get('/', applicationController.getApps);
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
router.put('/:id', applicationController.updateAppById);
/**
 * @swagger
 * /applications/{id}:
 *  delete:
 *    tags: [Applications API]
 *    summary: Delete an application by ID
 *    description: Delete a specific application from the database by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the application to delete.
 *    responses:
 *      200:
 *        description: The deleted application data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Application'
 */
router.delete('/:id', applicationController.deleteAppById);

module.exports = router;
