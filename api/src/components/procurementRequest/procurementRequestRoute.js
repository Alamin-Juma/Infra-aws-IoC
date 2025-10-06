import express from 'express';

import {
    getAllProcurementRequests,
    getProcurementRequestById,
    updateProcurementRequest,
} from './procurementRequestController.js';
import {validateId} from './procurementRequestValidation.js';


const router = express.Router();


router.get('/', getAllProcurementRequests);

router.get('/:id',validateId, getProcurementRequestById);

router.put('/:id',validateId, updateProcurementRequest);

export default router;


