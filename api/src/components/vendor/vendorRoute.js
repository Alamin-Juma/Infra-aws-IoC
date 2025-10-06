import express from 'express';

import {
    getAllVendors,   
    getVendorById,
    
} from './vendorController.js';

const router = express.Router();


router.get('/', getAllVendors);

router.get('/:id', getVendorById);

export default router;



