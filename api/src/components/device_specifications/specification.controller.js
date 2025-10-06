import deviceSpecificationService from './specification.service.js';


export const createDeviceSpecification = async (req, res) => {
    const { name, fieldType, selectOptions } = req.body;

    // Validate 'name' field
    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    // Validate 'fieldType'
    const allowedFieldTypes = ['text', 'select', 'number', 'boolean'];
    if (!fieldType || !allowedFieldTypes.includes(fieldType)) {
        return res.status(400).json({ error: 'Invalid fieldType provided' });
    }

    // Ensure 'selectOptions' is properly formatted
    let formattedSelectOptions = [];

    if (fieldType === 'select') {
        if (!Array.isArray(selectOptions) || selectOptions.length < 1) {
            return res.status(400).json({ error: 'Select options must be a non-empty array' });
        }
        formattedSelectOptions = selectOptions; // Keep as is
    }

    try {
        const newSpec = await deviceSpecificationService.createDeviceSpecification({
            name,
            fieldType,
            selectOptions: formattedSelectOptions, // Always an array (never null)
        });

        res.status(201).json(newSpec);
    } catch (error) {

        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Device specification with this name already exists' });
        }

        res.status(500).json({ error: 'Failed to create device specification' });
    }
};



export const getAllDeviceSpecifications = async (req, res) => {
    // Parse and validate page and limit
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10; 

    // Validate that page and limit are positive integers
    if (page < 1 || limit < 1 || isNaN(page) || isNaN(limit)) {
        return res.status(400).json({ error: 'Invalid page or limit value. Must be positive integers.' });
    }

    try {
        const result = await deviceSpecificationService.getAllDeviceSpecifications(page, limit);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch device specifications', details: error.message });
    }
};


 export const getDeviceSpecificationById = async (req, res) => {
    const { id } = req.params;

    try {
        const spec = await deviceSpecificationService.getDeviceSpecificationById(parseInt(id));
        if (!spec) {
            return res.status(404).json({ error: 'Device specification not found' });
        }
        res.status(200).json(spec);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch device specification' });
    }
};


export const updateDeviceSpecification = async (req, res) => {
    const { id } = req.params;
    const { name, fieldType, category, status } = req.body;

    try {
        const updatedSpec = await deviceSpecificationService.updateDeviceSpecification(
            parseInt(id),
            { name, fieldType, category, status }
        );
        res.status(200).json(updatedSpec);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Device specification not found' });
        }
        res.status(500).json({ error: 'Failed to update device specification' });
    }
};


export const deleteDeviceSpecification = async (req, res) => {
    const { id } = req.params;

    try {
        await deviceSpecificationService.deleteDeviceSpecification(parseInt(id));
        res.status(204).send();
    } catch (error) {
        if (error.message.includes('Cannot delete specification')) {
            return res.status(400).json({ error: error.message });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Device specification not found' });
        }
        res.status(500).json({ error: 'Failed to delete device specification' });
    }
};

