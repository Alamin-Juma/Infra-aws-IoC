import express from 'express';
import {
    createDeviceSpecification,
    getAllDeviceSpecifications,
    updateDeviceSpecification,
    getDeviceSpecificationById,
    deleteDeviceSpecification
} from './specification.controller.js'

const router = express.Router();


router.post('/', createDeviceSpecification);
router.get('/', getAllDeviceSpecifications);
router.get('/:id', getDeviceSpecificationById);
router.put('/:id', updateDeviceSpecification);
router.delete('/:id', deleteDeviceSpecification);

export default router;
