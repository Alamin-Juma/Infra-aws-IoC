import deviceService from './deviceService.js';

export const createDevice = async (req, res) => {
  try {
    const device = await deviceService.createDevice(req.body);
    res.status(201).json({ message: 'Device added successfully', device });
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Error saving device', error: error.message });
  }
};

export const updateDevice = async (req, res) => {
  try {
    const device = await deviceService.updateDevice(req.params.id, req.body);
    res.status(200).json({ message: 'Device updated successfully', device });
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Error updating device', error: error.message });
  }
};

export const deleteDevice = async (req, res) => {
  try {
    await deviceService.deleteDevice(req.params.id);
    res.status(200).json({ message: 'Device deleted successfully' });
  } catch (error) {
    if (
      error.message === 'Cannot delete a device that is assigned to a user.'
    ) {
      res.status(409).json({ message: error.message });
    } else {
      res
        .status(400)
        .json({ message: 'Error deleting device', error: error.message });
    }
  }
};

// Fetch all devices
export const getAllDevices = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    keyword = '',
    manufacturer = '',
    deviceType = '',
    deviceCondition = '',
  } = req.query;

  try {
    const [devices, total] = await deviceService.getAllDevices(
      Number(page),
      Number(limit),
      keyword,
      manufacturer,
      deviceType,
      deviceCondition,
    );

    res.json({
      message: 'Devices fetched successfully',
      devices,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch a single device by ID
export const getDeviceById = async (req, res) => {
  try {
    const device = await deviceService.getDeviceById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: 'Device not found' });
    }
    res.status(200).json(device);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching device', error: error.message });
  }
};

export const getDeviceHistoryBySerial = async (req, res) => {
  try {
    const { serialNumber } = req.params;
    const history = await deviceService.getDeviceHistoryBySerial(serialNumber);

    if (!history || history.message) {
      return res
        .status(404)
        .json({ message: history.message || 'No history found' });
    }

    res
      .status(200)
      .json({ message: 'Device history retrieved successfully', history });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching device history', error: error.message });
  }
};

export const handleUpdateDeviceCondition = async (req, res) => {
  const { id } = req.params;
  const { deviceConditionId, userId = null } = req.body;

  try {
    if (!deviceConditionId || isNaN(Number(deviceConditionId))) {
      const validConditions = await getValidConditions();
      return res.status(400).json({
        error: 'Valid deviceConditionId is required',
        validConditions,
      });
    }

    // Execute update
    const result = await deviceService.updateDeviceCondition(
      id,
      deviceConditionId,
      userId,
    );

    if (result.unchanged) {
      return res.status(200).json({
        message: 'Device condition unchanged',
        ...result,
      });
    }

    return res.json({
      message: 'Device condition updated successfully',
      ...result,
    });
  } catch (error) {
    const response = {
      error: error.message || 'Internal server error',
    };

    if (process.env.NODE_ENV === 'development') {
      response.stack = error.stack;
    }

    const statusCode = error.message.includes('not found') ? 404 : 500;
    return res.status(statusCode).json(response);
  }
};

export const getDeviceCountByType = async (req, res) => {
  const { page = 1, limit = 10, deviceType } = req.query;
  try {
    let filters = {};
    if (deviceType) {
      filters['deviceTypeId'] = Number(deviceType);
    }
    const result = await deviceService.getDeviceCountByType(
      Number(page),
      Number(limit),
      filters,
    );
    res.json({
      message: 'Records fetched successfully',
      devices: result.data, // Use 'data' instead of 'devices'
      total: result.total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createDevice,
  updateDevice,
  handleUpdateDeviceCondition,
  deleteDevice,
  getAllDevices,
  getDeviceById,
  getDeviceHistoryBySerial,
  getDeviceCountByType,
};
