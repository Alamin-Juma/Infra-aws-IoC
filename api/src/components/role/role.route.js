import express from 'express';
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  toggleRoleStatus,
  getAllPermissions,
} from './role.controller.js';
import { validateId } from '../procurementRequest/procurementRequestValidation.js';
import { validateCreateRole, validateUpdateRole } from './role.validations.js';

const router = express.Router();

router.get('/permissions', getAllPermissions);
/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management endpoints
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: A list of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 *       500:
 *         description: Server error
 */
router.get('/', getRoles);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: Get a role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: A single role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.get('/:id', validateId, getRoleById);

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/create', validateCreateRole, createRole);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update an existing role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.put('/:id', validateId, validateUpdateRole, updateRole);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Delete a role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', validateId, deleteRole);

/**
 * @swagger
 * /roles/{id}/toggle-status:
 *   patch:
 *     summary: Toggle the status of a role (active/inactive)
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role status toggled successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/toggle-status', validateId, toggleRoleStatus);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the role
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the role
 *           example: 'Admin'
 *         status:
 *           type: boolean
 *           description: Role status (active/inactive)
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Role creation timestamp
 *           example: '2024-04-01T12:00:00Z'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp for the role
 *           example: '2024-04-01T12:30:00Z'
 *         lastUpdatedBy:
 *           type: integer
 *           description: ID of the user who last updated this role
 *           example: 2
 */
