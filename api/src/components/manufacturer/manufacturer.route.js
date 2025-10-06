import express from 'express';

import {
    getAllManufacturers,
    createManufacturer,
    deleteManufacturer,
    updateManufacturer
} from './manufacturer.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Manufacturers
 *   description: Operations related to manufacturers
 */

/**
 * @swagger
 * /manufacturers:
 *   get:
 *     summary: Get all manufacturers
 *     tags: [Manufacturers]
 *     responses:
 *       200:
 *         description: A list of manufacturers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Manufacturer'
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllManufacturers);

/**
 * @swagger
 * /manufacturers:
 *   post:
 *     summary: Create a new manufacturer
 *     tags: [Manufacturers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ManufacturerCreate'
 *     responses:
 *       201:
 *         description: Manufacturer created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/', createManufacturer);

/**
 * @swagger
 * /manufacturers/{id}:
 *   delete:
 *     summary: Delete a manufacturer by ID
 *     tags: [Manufacturers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The manufacturer ID
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Manufacturer deleted successfully
 *       404:
 *         description: Manufacturer not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteManufacturer);

/**
 * @swagger
 * /manufacturers/{id}:
 *   put:
 *     summary: Update a manufacturer by ID
 *     tags: [Manufacturers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The manufacturer ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ManufacturerUpdate'
 *     responses:
 *       200:
 *         description: Manufacturer updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Manufacturer not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', updateManufacturer);

export default router;
