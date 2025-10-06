import {
  vendorRegister,
  fetchAllVendors,
  getVendorById,
  updateVendorInDB,
  archiveVendorr,
  toggleVendorStatus,
} from './vendorRegister.service.js';
import { vendorSchema } from '../schemas/vendorSchema.js';
import { vendorQuerySchema } from '../schemas/vendorSchema.js';
import { vendorIdParamSchema } from '../schemas/vendorSchema.js';

export const createVendor = async (req, res) => {
  try {
    await vendorSchema.validate(req.body, { abortEarly: false });

   const serviceResponse =  await vendorRegister(req.body);

    return res.status(200).json({ message: 'Vendor registration request received' });
  } catch (error) {

    // Yup validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = error.inner.reduce((acc, curr) => {
        acc[curr.path] = curr.message;
        return acc;
      }, {});
      return res.status(400).json({ errors: validationErrors });
    }


    // Backend custom errors
    if (error.message.includes('DUPLICATE_EMAIL')) {
      return res.status(400).json({ errors: { email: 'A vendor with this email already exists.' } });
    }

    if (error.message.includes('DUPLICATE_NAME')) {
      return res.status(400).json({ errors: { name: 'A vendor with this name already exists.' } });
    }

    if (error.message.includes('INVALID_EMAIL')) {
      return res.status(400).json({ errors: { email: 'Please provide a valid email address.' } });
    }

    return res.status(500).json({ message: 'Server error' });
  }
};



export const updateVendor = async (req, res) => {
  try {
    const { id, deviceTypeSupplied, ...data } = req.body;

    if (deviceTypeSupplied && Array.isArray(deviceTypeSupplied)) {
      const sanitizedDeviceTypes = deviceTypeSupplied
        .map((item) => {
          return typeof item === 'number' ? item : NaN;
        })
        .filter((item) => !isNaN(item)); // Remove NaN values

      data.deviceTypeSupplied = sanitizedDeviceTypes;
    }

    await vendorSchema.validate(data, { abortEarly: false });

    const result = await updateVendorInDB(id, data);

    if (!result) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.status(200).json(result);
  } catch (error) {

    if (error.name === 'ValidationError') {
      const validationErrors = error.inner.reduce((acc, curr) => {
        acc[curr.path] = curr.message;
        return acc;
      }, {});
      return res.status(400).json({ errors: validationErrors });
    }

    if (
      error.message === 'Missing required fields' ||
      error.message === 'Invalid email format'
    ) {
      return res.status(400).json({ message: error.message });
    }

    if (error.message === 'Vendor not found') {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllVendors = async (req, res) => {
  try {
    const validatedQuery = await vendorQuerySchema.validate(req.query, {
      abortEarly: false,
    });

    const vendors = await fetchAllVendors(validatedQuery);

    res.json(vendors);
  } catch (error) {

    if (error.name === 'ValidationError') {
      const validationErrors = error.inner.reduce((acc, curr) => {
        acc[curr.path] = curr.message;
        return acc;
      }, {});
      return res.status(400).json({ errors: validationErrors });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

export const fetchVendor = async (req, res) => {
  const { id } = req.params;

  try {
    await vendorIdParamSchema.validate({ id });

    const vendor = await getVendorById(id);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    res.status(200).json(vendor);
  } catch (error) {

    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Server error' });
  }
};

export const archiveVendor = async (req, res) => {
  const { id } = req.params;

  try {
    await vendorIdParamSchema.validate({ id });

    await archiveVendorr(id);

    return res.status(204).send('Deleted successfully');
  } catch (error) {

    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to archive vendor' });
  }
};

export const bulkArchiveVendors = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No valid vendor IDs provided.' });
    }

    for (const id of ids) {
      try {
        await vendorIdParamSchema.validate({ id });
      } catch (validationError) {
        return res.status(400).json({ error: `Invalid ID: ${id}` });
      }
    }

    const result = await Promise.all(ids.map((id) => archiveVendorr(id)));

    return res.status(200).json({
      message: 'Vendors archived successfully.',
      archivedCount: result.length,
    });
  } catch (error) {

    res.status(500).json({
      message: 'Failed to archive vendors. Please try again later.',
      error: error.message,
    });
  }
};

export const toggleStatus = async (req, res) => {
  const vendorId = parseInt(req.params.id, 10);

  try {
    const status = await toggleVendorStatus(vendorId);
    return res.status(200).json({ status });
  } catch (error) {
    console.error('Error toggling vendor status:', error);

    if (error.message === 'Vendor not found') {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    if (error.message.includes('active contract')) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};
