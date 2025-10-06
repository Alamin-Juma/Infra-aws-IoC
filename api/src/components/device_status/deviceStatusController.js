import { 
    getAllDeviceStatuses, 
    getDeviceStatusById, 
    createDeviceStatus, 
    updateDeviceStatus, 
    deleteDeviceStatus 
} from './deviceStatusService.js';


export const getAllDeviceStatusesController = async (req, res) => {
    try {
        const deviceStatuses = await getAllDeviceStatuses();
        res.status(200).json(deviceStatuses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching device statuses', error: error.message });
    }
};

export const getDeviceStatusByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const deviceStatus = await getDeviceStatusById(id);
        if (!deviceStatus) {
            return res.status(404).json({ message: 'Device status not found' });
        }
        res.status(200).json(deviceStatus);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching device status', error: error.message });
    }
};

export const createDeviceStatusController = async (req, res) => {
    try {
        const data = req.body;
        const newDeviceStatus = await createDeviceStatus(data);
        res.status(201).json({ message: 'Device status created successfully', data: newDeviceStatus });
    } catch (error) {
        res.status(400).json({ message: 'Error creating device status', error: error.message });
    }
};

export const updateDeviceStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updatedDeviceStatus = await updateDeviceStatus(id, data);
        res.status(200).json({ message: 'Device status updated successfully', data: updatedDeviceStatus });
    } catch (error) {
        res.status(400).json({ message: 'Error updating device status', error: error.message });
    }
};

export const deleteDeviceStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteDeviceStatus(id);
        res.status(200).json({ message: 'Device status deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting device status', error: error.message });
    }
};

export default {
    getAllDeviceStatusesController,
    getDeviceStatusByIdController,
    createDeviceStatusController,
    updateDeviceStatusController,
    deleteDeviceStatusController
};
