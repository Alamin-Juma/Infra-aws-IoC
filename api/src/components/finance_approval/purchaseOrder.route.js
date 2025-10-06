import express from 'express';
import {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrderStatus,
} from './purchaseOrder.controller.js';
const router = express.Router();
router.get('/', getAllPurchaseOrders);
router.get('/:id', getPurchaseOrderById);
router.patch('/:id', getPurchaseOrderById);
router.patch('/:id/update-status', updatePurchaseOrderStatus);
export default router;
