import express from "express"
import { createRepairRequest, deleteRepairRequest, getRepairRequestDetails, listRepairRequests, updateRepairRequestDeviceStatus, updateRepairRequest, getRepairRequestsSummary } from "./repairRequest.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RepairRequests
 *   description: Manage repair requests in the system
 */

/**
 * @swagger
 * /api/repair-requests:
 *   get:
 *     summary: Get all repair requests
 *     tags: [RepairRequests]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *           required: false
 *           default: null
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: Date
 *           required: false
 *           default: null
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: Date
 *           required: false
 *           default: null
 *     responses:
 *       200:
 *         description: Successfully retrieved a list of device types.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RepairRequests'
 *       400:
 *         description: Bad request (invalid input)
 *       403:
 *         description: Lacks some permissions
 *       500:
 *         description: Internal server error
 */
router.get('/', listRepairRequests)

/**
 * @swagger
 * /api/repair-requests/summary:
 *   get:
 *     summary: Stats for repair requests
 *     description: Get summary of repair requests grouped by current status
 *     tags: [RepairRequests]
 *     responses:
 *       200:
 *         description: Repair requests summary fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RepairRequests'
 *       500:
 *         description: Failed to get repair requests summary
 */
router.get('/summary', getRepairRequestsSummary);

/**
 * @swagger
 * /api/repair-requests/{id}:
 *   get:
 *     summary: Get a repair request by ID
 *     description: Retrieve details of a specific repair request by ID.
 *     tags: [RepairRequests]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the repair request to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved repair request.
 *         content:
 *           application/json:
 *       404:
 *         description: Repair request not found not found.
 */
router.get('/:id', getRepairRequestDetails)

/**
 * @swagger
 * /api/repair-requests:
 *   post:
 *     summary: Create a new repair request
 *     tags: [RepairRequests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - severity
 *               - deviceType
 *               - affectedDevices
 *             properties:
 *               description:
 *                 type: string
 *                 example: "The screen is cracked and unresponsive."
 *               severity:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *                 example: "High"
 *               deviceType:
 *                 type: integer
 *                 example: 3
 *               affectedDevices:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Repair request created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post('/', createRepairRequest);

/**
 * @swagger
 * /api/repair-requests/{id}:
 *   delete:
 *     summary: Delete a repair request by ID
 *     description: Soft delete a repair request and attached repair devices
 *     tags: [RepairRequests]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the repair request to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Repair request deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RepairRequests'
 *       404:
 *         description: Repair request not found.
 */
router.delete('/:id', deleteRepairRequest);

/**
 * @swagger
 * /api/repair-requests/summary:
 *   get:
 *     summary: Stats for repair requests
 *     description: Get summary of repair requests grouped by current status
 *     tags: [RepairRequests]
 *     responses:
 *       200:
 *         description: Repair requests summary fetched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RepairRequests'
 *       500:
 *         description: Failed to get repair requests summary
 */
router.get('/summary', getRepairRequestsSummary);

router.patch('/:id/devices/:deviceId/status', updateRepairRequestDeviceStatus);


/**
 * @swagger
 * /api/repair-requests/{id}:
 *   patch:
 *     summary: Update a repair request
 *     tags: [RepairRequests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the repair request to update
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 example: "The screen is cracked and unresponsive."
 *               severity:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *                 example: "High"
 *               deviceType:
 *                 type: integer
 *                 example: 3
 *               location:
 *                 type: string
 *                 example: "Amani"
 *               assignedTo:
 *                 type: integer
 *                 example: 2
 *               affectedDevices:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Repair request updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Repair request not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id', updateRepairRequest);

export default router;
