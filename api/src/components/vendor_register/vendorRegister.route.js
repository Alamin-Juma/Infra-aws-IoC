import express from 'express';
import {
  createVendor,
  updateVendor,
  getAllVendors,
  fetchVendor,
  archiveVendor,
  bulkArchiveVendors,
  toggleStatus,
} from './vendorRegister.controller.js';

const router = express.Router();

router.post('/create', createVendor);
router.get('/get-all', getAllVendors);
router.get('/:id', fetchVendor);
router.put('/update/:id', updateVendor);
router.delete('/:id/archive', archiveVendor);
router.post('/bulk/archive', bulkArchiveVendors);
router.patch('/:id/toggle-status', toggleStatus);

export default router;
