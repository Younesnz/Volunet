const express = require('express');

const router = express.Router();

const { authenticate, adminOnly } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

// getReports can be filtered by query
// acceptable queries: status, category, after(time), before(time), userId, adminId, eventId

/**
 * @swagger
 * tags:
 *  - name: Reports API
 *    description: Endpoints for managing reports
 */

/**
 * @swagger
 * /reports:
 *  get:
 *    tags: [Reports API]
 *    summary: Get all reports
 *    description: Retrieve all reports from the database.
 *    responses:
 *      200:
 *        description: A list of reports
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Report'
 */
router.get('/', authenticate, adminOnly, reportController.getReports);
/**
 * @swagger
 * /reports:
 *  post:
 *    tags: [Reports API]
 *    summary: Create a new report
 *    description: Create a new report in the database.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Report'
 *    responses:
 *      200:
 *        description: The created report
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Report'
 */
router.post('/', authenticate, reportController.addReport);
/**
 * @swagger
 * /reports/{id}:
 *  get:
 *    tags: [Reports API]
 *    summary: Get a report by ID
 *    description: Retrieve a specific report from the database by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the report to retrieve.
 *    responses:
 *      200:
 *        description: The report data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Report'
 */
router.get('/:id', authenticate, adminOnly, reportController.getReportById);
/**
 * @swagger
 * /reports/{id}:
 *  put:
 *    tags: [Reports API]
 *    summary: Update a report by ID
 *    description: Update a specific report in the database by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the report to update.
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Report'
 *    responses:
 *      200:
 *        description: The updated report data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Report'
 */
router.put('/:id', authenticate, adminOnly, reportController.updateReportById);
/**
 * @swagger
 * /reports/{id}:
 *  delete:
 *    tags: [Reports API]
 *    summary: Delete a report by ID
 *    description: Delete a specific report from the database by ID.
 *    parameters:
 *    - in: path
 *      name: id
 *      schema:
 *        type: string
 *      required: true
 *      description: ID of the report to delete.
 *    responses:
 *      200:
 *        description: The deleted report data
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Report'
 */
router.delete(
  '/:id',
  authenticate,
  adminOnly,
  reportController.deleteReportById
);

module.exports = router;
