import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Parser } from 'json2csv';

const router = express.Router();
const prisma = new PrismaClient();

// API to get inventory summary by manufacturer
router.get('/manufacturer-inventory', async (req, res) => {
    try {
        const { manufacturerId, status, condition, exportType } = req.query;

        // Query filtering logic
        const devices = await prisma.device.findMany({
            where: {
                manufacturerId: manufacturerId ? parseInt(manufacturerId) : undefined,
                deviceStatusId: status ? parseInt(status) : undefined,
                deviceConditionId: condition ? parseInt(condition) : undefined,
            },
            include: {
                manufacturer: true,
                deviceType: true,
                deviceStatus: true,
                deviceCondition: true,
            },
        });

        if (devices.length === 0) {
            return res.status(404).json({ message: "No inventory records found for the selected filters." });
        }

        // Process Data
        const summary = devices.reduce((acc, device) => {
            const manufacturer = device.manufacturer.name;
            const type = device.deviceType.name;
            const key = `${manufacturer}-${type}`;

            if (!acc[key]) {
                acc[key] = {
                    manufacturer,
                    deviceType: type,
                    total: 0,
                    assigned: 0,
                    available: 0,
                    lost: 0,
                    broken: 0,
                };
            }

            acc[key].total += 1;
            if (device.deviceStatus.name === 'Assigned') acc[key].assigned += 1;
            if (device.deviceStatus.name === 'Available') acc[key].available += 1;
            if (device.deviceCondition.name === 'Lost') acc[key].lost += 1;
            if (device.deviceCondition.name === 'Broken') acc[key].broken += 1;

            return acc;
        }, {});

        // Convert to Array and Calculate Percentage Breakdown
        const report = Object.values(summary).map(item => ({
            ...item,
            percentageBroken: ((item.broken / item.total) * 100).toFixed(2) + "%",
        }));

        if (exportType === "csv") {
            const fields = ["manufacturer", "deviceType", "total", "assigned", "available", "lost", "broken", "percentageBroken"];
            const parser = new Parser({ fields });
            const csv = parser.parse(report);
            res.header('Content-Type', 'text/csv');
            res.attachment("manufacturer_inventory.csv");
            return res.send(csv);
        }

        res.json(report);
    } catch (error) {
        res.status(500).json({ message: "Error exporting the report. Please try again later." });
    }
});

export default router;
