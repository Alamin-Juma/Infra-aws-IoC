import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllDeviceTypes = async (page = 1, limit = 10) => {
  if (page < 1 || limit < 1) {
    throw new Error('Page and limit must be positive integers.');
  }

  const [specs, totalCount] = await prisma.$transaction([
    prisma.deviceType.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            devices: {
              where: { deletedAt: null },
            },
          }
        }
      }
    }),
    prisma.deviceType.count(),
  ]);

  return {
    data: specs,

    total: totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
};

const getDeviceTypeById = async (id) => {
  return await prisma.deviceType.findFirst({
    where: { id: Number(id), deletedAt: null },
  });
};

const createDeviceType = async (deviceTypeData) => {
  try {
    let { name, specifications, status, lastUpdatedBy, low_stock_limit } = deviceTypeData;

    if (!name || typeof name !== 'string') {
      throw new Error('Device type name is required and must be a string.');
    }

    name = name.trim();
    lastUpdatedBy = lastUpdatedBy ? lastUpdatedBy.trim() : null;

    if (!name) {
      throw new Error('Device type name cannot be empty.');
    }

    if (name.length > 50) {
      throw new Error('Device type name cannot exceed 50 characters.');
    }

    const existingDeviceType = await prisma.deviceType.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive", 
        },
      },
    });

    if (existingDeviceType) {
      throw new Error(`A device type with the name '${name}' already exists.`);
    }

    if (!Array.isArray(specifications)) {
      specifications = [];
    }

   
    low_stock_limit = (typeof low_stock_limit === "number" && low_stock_limit >= 0) ? low_stock_limit : 5;

    const newDeviceType = await prisma.deviceType.create({
      data: {
        name,
        specifications: JSON.stringify(specifications),
        status,
        low_stock_limit,
        lastUpdatedBy,
      },
    });

    return newDeviceType;
  } catch (error) {
    throw new Error(error.message);
  }
};




const updateDeviceType = async (id, data) => {
  try {
    let { name, specifications, status, lastUpdatedBy, low_stock_limit } = data;
    

    if (!name || typeof name !== "string") {
      throw new Error("Device type name is required and must be a string.");
    }

    name = name.trim();
    lastUpdatedBy = lastUpdatedBy ? lastUpdatedBy.trim() : null;

    if (!name) {
      throw new Error("Device type name cannot be empty.");
    }

    if (name.length > 50) {
      throw new Error("Device type name cannot exceed 50 characters.");
    }

   
    const existingDeviceType = await prisma.deviceType.findUnique({
      where: { id: Number(id) },
    });

    if (!existingDeviceType) {
      throw new Error('Device type not found.');
    }

    
    if (existingDeviceType.name.toLowerCase() !== name.toLowerCase()) {
      const duplicateDeviceType = await prisma.deviceType.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive',
          },
          NOT: {
            id: Number(id), 
          },
        },
      });

      if (duplicateDeviceType) {
        throw new Error(
          `A device type with the name '${name}' already exists.`,
        );
      }
    }

    
    specifications = Array.isArray(specifications) ? specifications : [];

    low_stock_limit = (typeof low_stock_limit === "number" && low_stock_limit >= 0) ? low_stock_limit : 5;
    return await prisma.deviceType.update({
      where: { id: Number(id) },
      data: {
        name,
        specifications: JSON.stringify(specifications),
        low_stock_limit:low_stock_limit,
        lastUpdatedBy,
      },
    });
  } catch (error) {
    throw new Error('Failed to update device type. Please try again.', error);
  }
};

const deleteDeviceType = async (id) => {
  const deviceType = await prisma.deviceType.findUnique({
    where: { id: Number(id) },
    include: { devices: true },
  });
  if (deviceType.devices.length > 0) {
    throw new Error('This device type is in use and cannot be deleted.');
  }
  return await prisma.deviceType.delete({ where: { id: Number(id) } });
};

export default {
  getAllDeviceTypes,
  getDeviceTypeById,
  createDeviceType,
  updateDeviceType,
  deleteDeviceType,
};
