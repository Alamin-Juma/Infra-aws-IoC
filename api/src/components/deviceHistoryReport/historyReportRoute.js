import express from 'express';
import historyReportController from './historyReportController.js';
import { 
  validateDeviceHistoryParams,
  validateExportParams
} from './historyMiddleware.js';

const router = express.Router();

router.get(
  '/',
  validateDeviceHistoryParams,
  historyReportController.getDeviceHistory
);

router.get(
  '/export',
  validateExportParams,
  historyReportController.exportDeviceHistory
);

export default router;

