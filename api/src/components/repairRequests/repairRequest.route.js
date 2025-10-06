import express from "express"
import { createRepairRequest, deleteRepairRequest, getRepairRequestDetails, listRepairRequests } from "./repairRequest.controller.js";

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
 *             schema:
 *               $ref: '#/components/schemas/RepairRequests'
 *       404:
 *         description: Repair request not found not found.
 */
router.get('/:id', getRepairRequestDetails)
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

export default router;
