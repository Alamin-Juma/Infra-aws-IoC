import express from 'express';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';

import {
  getVendorEvaluations,
  getVendorEvaluationById,
  createVendorEvaluationHandler,
} from './vendorEvaluationController.js';

const router = express.Router();


router.get('/', getVendorEvaluations);


router.get('/:id', getVendorEvaluationById);


router.post('/', createVendorEvaluationHandler);

export default router;





