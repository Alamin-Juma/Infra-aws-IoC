import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';  

const prisma = new PrismaClient();

export const fetchVendorDevices = async () => {
  try {
    return await prisma.vendorDeviceType.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    throw new AppError(500, `Failed to fetch vendor devices: ${error.message}`);
  }
};




