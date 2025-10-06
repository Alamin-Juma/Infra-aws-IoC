import express from 'express';

import {
    getVendorDevices        
} from './vendorDeviceController.js';

const router = express.Router();

router.get('/', getVendorDevices);

export default router;



