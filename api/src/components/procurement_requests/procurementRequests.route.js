import express from 'express';
import {
  createProcurementRequestItems,
  getAllProcurementRequestItems,
  createProcurementRequest,
  getProcurementRequestItem,
  updateProcurementRequestItem,
  deleteProcurementRequestItem,
  getAllProcurementRequests,
  ApproveRejectProcurementRequest,
  updateProcurementRequest,
  getProcurementRequest,
} from './procurementRequests.controller.js';
import {
  validateId,
  validateProcurementItemsRequest,
  validateProcurementRequest,
  validateProcurementRequestItemUpdate,
  validateProcurementRequestUpdate,
} from './procurementRequests.validations.js';

const router = express.Router();
router.post(
  '/items',
  validateProcurementItemsRequest,
  createProcurementRequestItems,
);
router.get('/items', getAllProcurementRequestItems);
router.get('/:id', validateId, getProcurementRequest);
router.post('/', validateProcurementRequest, createProcurementRequest);
router.get('/', getAllProcurementRequests);
router.get('/item/:id', validateId, getProcurementRequestItem);
router.put(
  '/item/:id',
  validateId,
  validateProcurementRequestItemUpdate,
  updateProcurementRequestItem,
);
router.delete('/item/:id', validateId, deleteProcurementRequestItem);
router.put('/:id/:action', validateId, ApproveRejectProcurementRequest);
router.put(
  '/:id',
  validateId,
  validateProcurementRequestUpdate,
  updateProcurementRequest,
);

export default router;
