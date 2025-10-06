import express from 'express';
import {
  getDeviceStatistics,
  getMonthlyCounts,
  getDevicesConditionsAndStatuses,
} from './dashboardStatsController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard Statistics
 *   description: API for checking device statistics
 */

/**
 * @swagger
 * /api/analytics/statistics:
 *   get:
 *     summary: Get device statistics
 *     description: Fetch overall statistics for devices in the system.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Device statistics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceStatistics'
 */
router.get('/statistics', getDeviceStatistics);

/**
 * @swagger
 * /api/analytics/statistics:
 *   get:
 *     summary: Get monthly request counts
 *     description: Fetch monthly request counts data.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Monthly request counts fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MonthlyRequestCounts'
 */
router.get('/monthly-requests', getMonthlyCounts);

/**
 * @swagger
 * /api/analytics/statistics:
 *   get:
 *     summary: Get device conditions and statuses
 *     description: Fetch device condition and status summary.
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Device conditions and statuses fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeviceSummary'
 */
router.get('/devices-summary', getDevicesConditionsAndStatuses);


export default router;
