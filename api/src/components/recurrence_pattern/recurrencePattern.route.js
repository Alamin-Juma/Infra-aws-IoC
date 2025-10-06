import express from 'express';
import {
  getRecurrencePatterns,
  createRecurrencePattern,
  updateRecurrencePattern,
  toggleRecurrencePatternStatus,
  deleteRecurrencePattern
} from './recurrencePattern.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: RecurrencePatterns
 *   description: Recurrence pattern management
 */

/**
 * @swagger
 * /recurrence-patterns:
 *   get:
 *     summary: Get recurrence patterns (paginated)
 *     tags: [RecurrencePatterns]
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
 *     responses:
 *       200:
 *         description: List of recurrence patterns
 */
router.get('/', getRecurrencePatterns);

/**
 * @swagger
 * /recurrence-patterns:
 *   post:
 *     summary: Create a new recurrence pattern
 *     tags: [RecurrencePatterns]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               frequency:
 *                 type: integer
 *               unit:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Pattern created
 */
router.post('/', createRecurrencePattern);

/**
 * @swagger
 * /recurrence-patterns/{id}:
 *   put:
 *     summary: Update a recurrence pattern
 *     tags: [RecurrencePatterns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               frequency:
 *                 type: integer
 *               unit:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Pattern updated
 */
router.put('/:id', updateRecurrencePattern);

/**
 * @swagger
 * /recurrence-patterns/{id}/status:
 *   patch:
 *     summary: Toggle recurrence pattern status
 *     tags: [RecurrencePatterns]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status toggled
 */
router.put('/:id/status', toggleRecurrencePatternStatus);


/**
 * @swagger
 * paths:
 *   /recurrence-patterns/{id}:
 *     delete:
 *       summary: Delete recurrence pattern status
 *       tags: [RecurrencePatterns]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Status deleted
 */
router.delete('/:id', deleteRecurrencePattern);

export default router;
