import deviceTypeService from "./deviceTypeService.js";

export const getAllDeviceTypes = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const deviceTypes = await deviceTypeService.getAllDeviceTypes(Number(page), Number(limit));
    res.json(deviceTypes);
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const getDeviceTypeById = async (req, res) => {
  try {
    const deviceType = await deviceTypeService.getDeviceTypeById(req.params.id);
    if (!deviceType) return res.json({ error: 'Device type not found' });
    res.json(deviceType);
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const createDeviceType = async (req, res) => {
  try {
    const newDeviceType = await deviceTypeService.createDeviceType(req.body);
    res.json(newDeviceType).status(201);
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const updateDeviceType = async (req, res) => {
  try {
    const updatedDeviceType = await deviceTypeService.updateDeviceType(req.params.id, req.body);
    res.json(updatedDeviceType);
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const deleteDeviceType = async (req, res) => {
  try {
    await deviceTypeService.deleteDeviceType(req.params.id);
    res.json({ message: 'Device type deleted successfully' });
  } catch (error) {
    res.json({ error: error.message });
  }
};
