import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js'; 
import { idSchema } from './vendorValidation.js';  
import config from '../../configs/app.config.js'; 

const prisma = new PrismaClient();

const getAllVendors = async (page = config.PAGE, limit = config.PAGE_LIMIT) => {
  try {
    const where = {
      deletedAt: null
    };

    return prisma.$transaction([
      prisma.vendor.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          physicalAddress: true,
          deviceTypeSupplied: true,
          contractStartDate: true,
          contractEndDate: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      prisma.vendor.count({ where }),
    ]);
  } catch (error) {
    throw new AppError(400, error.message || 'Invalid pagination parameters');
  }
};

const getVendorById = async (id) => {
  try {
   
    await idSchema.validate({ id });

    const vendor = await prisma.vendor.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        physicalAddress: true,
        deviceTypeSupplied: true,
        contractStartDate: true,
        contractEndDate: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!vendor) {
      throw new AppError(404, `Vendor with ID ${id} not found.`);
    }

    return vendor;
  } catch (error) {
    throw new AppError(400, error.message || 'Invalid vendor ID');
  }
};

export default {
  getAllVendors,    
  getVendorById,       
};


