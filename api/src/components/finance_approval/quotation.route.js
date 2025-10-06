import express from 'express';
import {
  getAllQuotations,
  getQuotationById,
  updateQuotationStatus,
} from './quotation.controller.js';
const router = express.Router();
router.get('/', getAllQuotations);
router.get('/:id', getQuotationById);
router.patch('/:id/update-status', updateQuotationStatus);
export default router;
