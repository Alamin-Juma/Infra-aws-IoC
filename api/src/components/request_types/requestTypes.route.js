import express from 'express';
import {
  createRequestType,
  getAllRequestTypes,
  getRequestTypeById,
  updateRequestType,
  deleteRequestType,
  verify
} from './requestTypes.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RequestTypes
 *   description: Manage request types in the system
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     requestType:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 'Unique identifier for the request type'
 *           example: 1
 *         name:
 *           type: string
 *           description: 'The name of the request type'
 *           example: 'Service Request'
 *         description:
 *           type: string
 *           description: 'A brief description of the request type'
 *           example: 'A request for general service needs'
 */

/**
 * @swagger
 * /request-types:
 *   post:
 *     summary: Create a new request type
 *     tags: [RequestTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the request type
 *                 example: "Service Request"
 *               description:
 *                 type: string
 *                 description: A brief description of the request type
 *                 example: "A request for general service needs"
 *     responses:
 *       201:
 *         description: Request type successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/requestType'
 *       400:
 *         description: Bad request, invalid input
 */
router.post('/', createRequestType);

/**
 * @swagger
 * /request-types:
 *   get:
 *     summary: Get all request types
 *     tags: [RequestTypes]
 *     responses:
 *       200:
 *         description: List of all request types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/requestType'
 *       500:
 *         description: Server error
 */
router.get('/', getAllRequestTypes);

/**
 * @swagger
 * /request-types/verify:
 *   get:
 *     summary: Get all request types
 *     tags: [RequestTypes]
 *     responses:
 *       200:
 *         description: List of all request types
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/requestType'
 *       500:
 *         description: Server error
 */
router.get('/verify', verify);

/**
 * @swagger
 * /request-types/{id}:
 *   get:
 *     summary: Get a request type by ID
 *     tags: [RequestTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the request type to fetch
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Request type details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/requestType'
 *       404:
 *         description: Request type not found
 */
router.get('/:id', getRequestTypeById);

/**
 * @swagger
 * /request-types/{id}:
 *   put:
 *     summary: Update a request type by ID
 *     tags: [RequestTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the request type to update
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the request type
 *                 example: "New Service Request"
 *               description:
 *                 type: string
 *                 description: A brief description of the request type
 *                 example: "A request for a new service request"
 *     responses:
 *       200:
 *         description: Request type successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/requestType'
 *       400:
 *         description: Bad request, invalid input
 *       404:
 *         description: Request type not found
 */
router.put('/:id', updateRequestType);

/**
 * @swagger
 * /request-types/{id}:
 *   delete:
 *     summary: Delete a request type by ID
 *     tags: [RequestTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the request type to delete
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Request type successfully deleted
 *       404:
 *         description: Request type not found
 */
router.delete('/:id', deleteRequestType);

export default router;
