import express from 'express';
import { createDevice, updateDevice, deleteDevice, getAllDevices, getDeviceById,handleUpdateDeviceCondition, getDeviceCountByType, getDeviceHistoryBySerial } from './deviceController.js';

import deviceMiddleware from './deviceMiddleware.js';

const router = express.Router();

router.post('/new', deviceMiddleware.validateDevice, createDevice);
router.put('/:id', updateDevice);
router.delete('/:id', deleteDevice);
router.get('/count', getDeviceCountByType);
router.get('/all', getAllDevices); // Fetch all devices
router.get('/:id', getDeviceById); // Fetch device by ID
router.patch(
    '/:id/condition',
    handleUpdateDeviceCondition
);
router.get('/:serialNumber', getDeviceHistoryBySerial);

export default router;
