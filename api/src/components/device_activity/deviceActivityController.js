import * as activityTypeService from './deviceActivityService.js';

// Get all ActivityTypes with pagination
export const getAllActivityTypes = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const activityTypes = await activityTypeService.getAllActivityTypes(Number(page), Number(limit));
    res.json(activityTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single ActivityType by ID
export const getActivityTypeById = async (req, res) => {
  const { id } = req.params;
  try {
    const activityType = await activityTypeService.getActivityTypeById(Number(id));
    res.json(activityType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new ActivityType
export const createActivityType = async (req, res) => {
  const { name, status, lastUpdatedBy } = req.body;
  try {
    const newActivityType = await activityTypeService.createActivityType({ name, status, lastUpdatedBy });
    res.status(201).json(newActivityType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an existing ActivityType
export const updateActivityType = async (req, res) => {
  const { id } = req.params;
  const { name, status, lastUpdatedBy } = req.body;
  try {
    const updatedActivityType = await activityTypeService.updateActivityType(Number(id), { name, status, lastUpdatedBy });
    res.json(updatedActivityType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an ActivityType
export const deleteActivityType = async (req, res) => {
  const { id } = req.params;
  try {
    await activityTypeService.deleteActivityType(Number(id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
