import express from 'express';
import { 
    cancelMaintenanceSchedule, 
    completeMaintenanceSchedule, 
    createMaintenanceSchedule, 
    deleteMaintenanceSchedule, 
    getMaintenanceSchedules, 
    updateMaintenanceSchedule, 
    updateMaintenanceScheduleServiceEntry 
} from './maintenanceSchedule.controller.js';

const router = express.Router();


router.get('/', getMaintenanceSchedules);

router.post('/', createMaintenanceSchedule);

router.patch('/:id', updateMaintenanceSchedule);

router.patch('/:id/cancel', cancelMaintenanceSchedule);

router.patch('/:id/complete', completeMaintenanceSchedule);

router.patch('/service-entry/:id', updateMaintenanceScheduleServiceEntry);

router.delete('/:id', deleteMaintenanceSchedule);


export default router;