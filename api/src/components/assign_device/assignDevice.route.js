import express from 'express';
import {
  assignDevice,
  unassignDevice
} from './assignDevice.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Device Assignment
 *   description: API for assigning and unassigning devices to users
 */

/**
 * @swagger
 * /assign/{id}:
 *   post:
 *     summary: Assign a device to a user
 *     tags: [Device Assignment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignDeviceRequest'
 *     responses:
 *       200:
 *         description: Device assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignDeviceResponse'
 */
router.post('/assign/:id', assignDevice);

/**
 * @swagger
 * /unassign/{id}:
 *   post:
 *     summary: Unassign a device from a user
 *     tags: [Device Assignment]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: Device unassigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnassignDeviceResponse'
 */
router.post('/unassign/:id', unassignDevice);

export default router;
