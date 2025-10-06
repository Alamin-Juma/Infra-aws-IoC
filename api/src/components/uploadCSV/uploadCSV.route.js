import express from 'express';
import { upload, uploadCSV } from './uploadCSV.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/uploadCSV:
 *   post:
 *     summary: Upload a CSV file
 *     tags:
 *       - CSV Upload
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Successfully uploaded CSV file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *       400:
 *         description: Bad Request - Invalid file
 *       500:
 *         description: Server Error
 */
router.post("/uploadCSV", upload.single("file"), uploadCSV);

export default router;
