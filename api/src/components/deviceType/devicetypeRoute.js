import express from 'express';
import {
  getAllDeviceTypes,
  getDeviceTypeById,
  createDeviceType,
  updateDeviceType,
  deleteDeviceType
} from './deviceTypeController.js';
import validateDeviceType from './deviceTypeMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /deviceTypes:
 *   get:
 *     summary: Get all device types
 *     description: Retrieve a list of all available device types.
 *     tags:
 *       - Device Types
 *     responses:
 *       200:
 *         description: Successfully retrieved a list of device types.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DeviceType'
 */
router.get('/', getAllDeviceTypes);

/**
 * @swagger
 * /deviceTypes/{id}:
 *   get:
 *     summary: Get a device type by ID
 *     description: Retrieve details of a specific device type by ID.
 *     tags:
 *       - Device Types
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the device type to retrieve.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved device type details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceType'
 *       404:
 *         description: Device type not found.
 */
router.get('/:id', getDeviceTypeById);

/**
 * @swagger
 * /deviceTypes:
 *   post:
 *     summary: Create a new device type
 *     description: Add a new device type with specifications.
 *     tags:
 *       - Device Types
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceType'
 *     responses:
 *       201:
 *         description: Device type created successfully.
 *       400:
 *         description: Invalid input.
 */
router.post('/', validateDeviceType, createDeviceType);

/**
 * @swagger
 * /deviceTypes/{id}:
 *   put:
 *     summary: Update a device type
 *     description: Modify an existing device type by ID.
 *     tags:
 *       - Device Types
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the device type to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeviceType'
 *     responses:
 *       200:
 *         description: Device type updated successfully.
 *       400:
 *         description: Invalid input.
 *       404:
 *         description: Device type not found.
 */
router.put('/:id', validateDeviceType, updateDeviceType);

/**
 * @swagger
 * /deviceTypes/{id}:
 *   delete:
 *     summary: Delete a device type
 *     description: Remove a device type by ID.
 *     tags:
 *       - Device Types
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the device type to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Device type deleted successfully.
 *       404:
 *         description: Device type not found.
 */
router.delete('/:id', deleteDeviceType);

export default router;
