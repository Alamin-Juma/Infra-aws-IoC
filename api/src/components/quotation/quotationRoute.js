import express from 'express';

import {
    getAllQuotations,
    createQuotation,    
    getQuotationById,
    updateQuotation,    
} from './quotationController.js';

const router = express.Router();


router.get('/', getAllQuotations);


router.post('/', createQuotation);


router.get('/:id', getQuotationById);


router.put('/:id', updateQuotation);

export default router;

