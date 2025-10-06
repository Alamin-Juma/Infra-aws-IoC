import express from 'express';
import {
  getAllActivityTypes,
  getActivityTypeById,
  createActivityType,
  updateActivityType,
  deleteActivityType,
} from './deviceActivityController.js';

const router = express.Router();

// ActivityType routes
router.get('/activity-types', getAllActivityTypes);
router.get('/activity-types/:id', getActivityTypeById);
router.post('/activity-types', createActivityType);
router.put('/activity-types/:id', updateActivityType);
router.delete('/activity-types/:id', deleteActivityType);

export default router;
