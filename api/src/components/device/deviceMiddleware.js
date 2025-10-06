import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const validateDevice = async (req, res, next) => {
    const { serialNumber } = req.body;
    if (!serialNumber) return res.status(400).json({ message: 'Serial number is required' });

    const existingDevice = await prisma.device.findUnique({ where: { serialNumber } });
    if (existingDevice) return res.status(400).json({ message: 'Serial number already exists' });

    next();
};

export default { validateDevice };
