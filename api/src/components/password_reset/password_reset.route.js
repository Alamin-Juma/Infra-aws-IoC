import express from 'express';
import { forgotPassword, resetPassword, validateToken } from './password_reset.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Password Reset
 *   description: Manage password reset requests in the system
 */

/**
 * @swagger
 * /password-reset:
 *   post:
 *     summary: Request a password reset
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email of the user requesting password reset
 *                 example: "user@griffinglobaltech.com"
 *     responses:
 *       200:
 *         description: Password reset request successful
 *       400:
 *         description: Invalid email address or other input errors
 *       404:
 *         description: User not found
 */
router.post('/', forgotPassword);

/**
 * @swagger
 * /password-reset/reset-password:
 *   post:
 *     summary: Reset the password using the reset token
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Reset token received in the password reset email
 *                 example: "ab4e3c9d6f8b3e7ac8d9"
 *               newPassword:
 *                 type: string
 *                 description: New password to set for the user
 *                 example: "newP@ssw0rd123"
 *     responses:
 *       200:
 *         description: Password successfully reset
 *       400:
 *         description: Invalid token or password
 *       404:
 *         description: Token expired or invalid
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /password-reset/validate-token/{token}:
 *   get:
 *     summary: Validate the password reset token
 *     tags: [Password Reset]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         description: The password reset token to validate
 *         schema:
 *           type: string
 *           example: "ab4e3c9d6f8b3e7ac8d9"
 *     responses:
 *       200:
 *         description: Token is valid
 *       400:
 *         description: Invalid token
 *       404:
 *         description: Token not found or expired
 */
router.get('/validate-token/:token', validateToken);

export default router;
