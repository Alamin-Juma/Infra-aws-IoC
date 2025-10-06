import express from 'express';
import { 
    getAllDeviceStatusesController, 
    getDeviceStatusByIdController, 
    createDeviceStatusController, 
    updateDeviceStatusController, 
    deleteDeviceStatusController 
} from './deviceStatusController.js';

const router = express.Router();

router.get('/', getAllDeviceStatusesController);
router.get('/:id', getDeviceStatusByIdController);
router.post('/', createDeviceStatusController);
router.put('/:id', updateDeviceStatusController);
router.delete('/:id', deleteDeviceStatusController);

export default router;
