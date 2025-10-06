import express from 'express';
import {
  fetchTickets,
  submitExternalRequest,
  getExternalRequests,
  getTicketById,
  updateTicket,
  getLostAndBrokenDeviceRequests,
  updateTicketStatus
} from './externalRequest.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: External Requests
 *   description: API for managing external device requests
 */

/**
 * @swagger
 * /external-requests:
 *   post:
 *     summary: Submit an external request
 *     description: Create a new external request for a device.
 *     tags: [External Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExternalRequestCreate'
 *     responses:
 *       201:
 *         description: Request successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExternalRequest'
 *       400:
 *         description: Bad request (invalid input)
 */
router.post('/', submitExternalRequest);

/**
 * @swagger
 * /external-requests/findAll:
 *   get:
 *     summary: Fetch all external requests
 *     description: Retrieve a list of all external requests.
 *     tags: [External Requests]
 *     responses:
 *       200:
 *         description: List of external requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExternalRequest'
 */
router.get('/findAll', fetchTickets);

/**
 * @swagger
 * /external-requests:
 *   get:
 *     summary: Get external requests
 *     description: Fetch all external requests for users.
 *     tags: [External Requests]
 *     responses:
 *       200:
 *         description: List of external requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExternalRequest'
 */
router.get('/', getExternalRequests);

/**
 * @swagger
 * /external-requests/lost-broken-requests:
 *   get:
 *     summary: Get lost and broken device requests
 *     description: Retrieve all external requests related to lost or broken devices.
 *     tags: [External Requests]
 *     responses:
 *       200:
 *         description: List of lost and broken device requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExternalRequest'
 */
router.get('/lost-broken-requests', getLostAndBrokenDeviceRequests);

/**
 * @swagger
 * /external-requests/{id}:
 *   get:
 *     summary: Get an external request by ID
 *     description: Retrieve details of a specific external request using its ID.
 *     tags: [External Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The external request ID
 *     responses:
 *       200:
 *         description: External request details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExternalRequest'
 *       404:
 *         description: Request not found
 */
router.get('/:id', getTicketById);

/**
 * @swagger
 * /external-requests/{id}:
 *   put:
 *     summary: Update an external request
 *     description: Update an existing external request's details.
 *     tags: [External Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The external request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExternalRequestCreate'
 *     responses:
 *       200:
 *         description: Request successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExternalRequest'
 *       400:
 *         description: Bad request (invalid input)
 *       404:
 *         description: Request not found
 */
router.put('/:id', updateTicket);

router.post('/statusDecision/:id', updateTicketStatus);

export default router;
