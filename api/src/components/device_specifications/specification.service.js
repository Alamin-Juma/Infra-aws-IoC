import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


const createDeviceSpecification = async (data, userId) => {
    const { name, fieldType, selectOptions } = data;
    return await prisma.deviceSpecification.create({
        data: {
            name,
            fieldType,
            selectOptions,
            lastUpdatedBy: userId,
        },
    });
};


const getAllDeviceSpecifications = async (page = 1, limit = 10) => {
    const offset = (page - 1) * limit;

    // Validate page and limit
    if (page < 1 || limit < 1) {
        throw new Error('Page and limit must be positive integers.');
    }

    const specs = await prisma.$queryRaw`
    SELECT * FROM "DeviceSpecification"
    ORDER BY LOWER(name) ASC
    LIMIT ${limit}
    OFFSET ${offset}
    `;

    const totalCount = await prisma.deviceSpecification.count();

    return {
        data: specs, // Alphabetically ordered list (case-insensitive)
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
    };
};


const getDeviceSpecificationById = async (id) => {
    const specification = await prisma.deviceSpecification.findUnique({
        where: { specification_id: id },
    });

    if (!specification) {
        throw new Error('Device specification not found.');
    }

    return specification;
};


const updateDeviceSpecification = async (id, data) => {
    const { name, fieldType, category, status } = data;

    const specification = await prisma.deviceSpecification.findUnique({
        where: { specification_id: id },
    });

    if (!specification) {
        throw new Error('Device specification not found.');
    }

    return await prisma.deviceSpecification.update({
        where: { specification_id: id },
        data: {
            name,
            fieldType,
            category,
            status
        },
    });
};


const deleteDeviceSpecification = async (id) => {
    const specification = await prisma.deviceSpecification.findUnique({
      where: { specification_id: id },
    });
  
    if (!specification) {
      throw new Error('Device specification not found.');
    }
  
    // Search for devices where specifications JSON contains the spec name
    const devicesUsingSpec = await prisma.device.findMany({
      where: {
        specifications: {
          path: ['$'],
          string_contains: specification.name
        }
      }
    });
  
    if (devicesUsingSpec.length > 0) {
        throw new Error("Cannot delete the specification as it is currently assigned to a device.");

    }
  
    return await prisma.deviceSpecification.delete({
      where: { specification_id: id },
    });
  };
  

export default {
    createDeviceSpecification,
    getAllDeviceSpecifications,
    getDeviceSpecificationById,
    updateDeviceSpecification,
    deleteDeviceSpecification,
};
