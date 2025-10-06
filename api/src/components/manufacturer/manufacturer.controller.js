import manufacturerService from "./manufacturer.service.js";

export const getAllManufacturers = async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Default page: 1, limit: 10

    try {
        const [manufacturers, total] = await manufacturerService.getAllManufacturers(Number(page), Number(limit));

        res.json({
            message: 'Manufacturers fetched successfully',
            manufacturers,
            total,
            page: Number(page),
            limit: Number(limit),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createManufacturer = async (req, res) => {
    try {
        const existingManufacturer = await manufacturerService.getManufacturerByName(req.body.name);
        if (existingManufacturer) return res.status(409).json({ error: 'Conflict', message: 'Manufacturer already exists!' });
        const manufacturer = await manufacturerService.createManufacturer(req.body);
        res.status(201).json(manufacturer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteManufacturer = async (req, res) => {
    try {
        await manufacturerService.deleteManufacturer(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateManufacturer = async (req, res) => {
    try {
        const manufacturer = await manufacturerService.updateManufacturer(req.params.id, req.body);
        res.json(manufacturer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
