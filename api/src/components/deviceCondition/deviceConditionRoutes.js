import express from 'express';
import deviceConditionController from './deviceConditionController.js'; 

const router = express.Router();

// Define routes
router.get('/', deviceConditionController.getAllDeviceConditionsController);
router.get('/:id', deviceConditionController.getDeviceConditionByIdController);
router.post('/', deviceConditionController.createDeviceConditionController);
router.put('/:id', deviceConditionController.updateDeviceConditionController);
router.delete('/:id', deviceConditionController.deleteDeviceConditionController);

// Export the router
export default router;
