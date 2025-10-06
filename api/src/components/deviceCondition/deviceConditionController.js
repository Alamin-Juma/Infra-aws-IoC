import { getAllDeviceConditions, getDeviceConditionById, createDeviceCondition, updateDeviceCondition, deleteDeviceCondition } from './deviceConditionService.js';


// Get all device conditions
export const getAllDeviceConditionsController = async (req, res) => {
    try {
        const deviceConditions = await getAllDeviceConditions();
        res.status(200).json(deviceConditions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching device conditions', error: error.message });
    }
};

// Get a device condition by ID
export const getDeviceConditionByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const deviceCondition = await getDeviceConditionById(id);
        if (!deviceCondition) {
            return res.status(404).json({ message: 'Device condition not found' });
        }
        res.status(200).json(deviceCondition);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching device condition', error: error.message });
    }
};

// Create a new device condition
export const createDeviceConditionController = async (req, res) => {
    try {
        const data = req.body;
        const newDeviceCondition = await createDeviceCondition(data);
        res.status(201).json({ message: 'Device condition created successfully', data: newDeviceCondition });
    } catch (error) {
        res.status(400).json({ message: 'Error creating device condition', error: error.message });
    }
};

// Update a device condition
export const updateDeviceConditionController = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedDeviceCondition = await updateDeviceCondition(id, data);
        res.status(200).json({ message: 'Device condition updated successfully', data: updatedDeviceCondition });
    } catch (error) {
        res.status(400).json({ message: 'Error updating device condition', error: error.message });
    }
};

// Delete a device condition
export const deleteDeviceConditionController = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteDeviceCondition(id);
        res.status(200).json({ message: 'Device condition deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting device condition', error: error.message });
    }
};

// Export the controller functions
export default {
    getAllDeviceConditionsController,
    getDeviceConditionByIdController,
    createDeviceConditionController,
    updateDeviceConditionController,
    deleteDeviceConditionController
};
