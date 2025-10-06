import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createDevice = async (data) => {
  try {
    const {
      serialNumber,
      deviceTypeId,
      manufacturerId,
      deviceSpecifications,
      specifications,
    } = data;

    if (!deviceTypeId || !manufacturerId) {
      throw new Error('Device type and manufacturer are required.');
    }

    if (!deviceSpecifications || typeof deviceSpecifications !== 'number') {
      throw new Error('deviceSpecifications must be a valid integer.');
    }

    if (specifications && typeof specifications !== 'object') {
      throw new Error('specifications must be a valid JSON object.');
    }

    const deviceTypeRecord = await prisma.deviceType.findUnique({
      where: { id: deviceTypeId },
    });
    const manufacturerRecord = await prisma.deviceManufacturer.findUnique({
      where: { id: manufacturerId },
    });

    if (!deviceTypeRecord)
      throw new Error(`Device type '${deviceTypeId}' not found.`);
    if (!manufacturerRecord)
      throw new Error(`Manufacturer '${manufacturerId}' not found.`);

    const defaultDeviceCondition = await prisma.deviceCondition.findFirst({
      where: { name: 'Good' },
    });

    if (!defaultDeviceCondition) {
      throw new Error("Default device condition 'Good' not found.");
    }

    const defaultDeviceStatus = await prisma.deviceStatus.findFirst({
      where: { name: 'available' },
    });

    if (!defaultDeviceStatus) {
      throw new Error("Default device status 'Available' not found.");
    }

    return await prisma.device.create({
      data: {
        serialNumber,
        deviceTypeId,
        manufacturerId,
        deviceConditionId: defaultDeviceCondition.id,
        deviceStatusId: defaultDeviceStatus.id,
        deviceSpecifications,
        specifications: specifications || null,
      },
    });
  } catch (error) {
    throw new Error(`Error saving device: ${error.message}`);
  }
};

const updateDevice = async (id, data) => {
  try {
    const {
      serialNumber,
      deviceTypeId,
      manufacturerId,
      deviceSpecifications,
      specifications,
    } = data;

    const existingDevice = await prisma.device.findUnique({
      where: { id: Number(id) },
    });

    if (!existingDevice) {
      throw new Error(`Device with ID ${id} not found.`);
    }

    if (deviceTypeId !== undefined && !deviceTypeId) {
      throw new Error('Device type is required when provided.');
    }

    if (manufacturerId !== undefined && !manufacturerId) {
      throw new Error('Manufacturer is required when provided.');
    }

    if (
      deviceSpecifications !== undefined &&
      typeof deviceSpecifications !== 'number'
    ) {
      throw new Error('deviceSpecifications must be a valid integer.');
    }

    if (
      specifications !== undefined &&
      (typeof specifications !== 'object' || Array.isArray(specifications))
    ) {
      throw new Error('specifications must be a valid JSON object.');
    }

    const verificationPromises = [];

    if (deviceTypeId !== undefined) {
      verificationPromises.push(
        prisma.deviceType
          .findUnique({
            where: { id: deviceTypeId },
          })
          .then((deviceType) => {
            if (!deviceType) {
              throw new Error(`DeviceType with ID ${deviceTypeId} not found`);
            }
          }),
      );
    }

    if (manufacturerId !== undefined) {
      verificationPromises.push(
        prisma.deviceManufacturer
          .findUnique({
            where: { id: manufacturerId },
          })
          .then((manufacturer) => {
            if (!manufacturer) {
              throw new Error(
                `Manufacturer with ID ${manufacturerId} not found`,
              );
            }
          }),
      );
    }

    await Promise.all(verificationPromises);

    if (serialNumber && serialNumber !== existingDevice.serialNumber) {
      const duplicate = await prisma.device.findUnique({
        where: { serialNumber },
      });
      if (duplicate) {
        throw new Error(
          `Device with serial number ${serialNumber} already exists`,
        );
      }
    }

    return await prisma.device.update({
      where: { id: Number(id) },
      data: {
        serialNumber,
        deviceTypeId,
        manufacturerId,
        deviceSpecifications,
        specifications:
          specifications !== undefined
            ? specifications
            : existingDevice.specifications,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    throw new Error(`Error updating device: ${error.message}`);
  }
};

const getDeviceHistoryBySerial = async (serialNumber) => {
  try {
    const device = await prisma.device.findUnique({
      where: { serialNumber },
      include: {
        deviceActivities: {
          include: {
            user: true,
            activityType: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!device) {
      return { message: `No history found for serial number: ${serialNumber}` };
    }

    return {
      serialNumber: device.serialNumber,
      deviceType: device.deviceType?.name || 'Unknown',
      manufacturer: device.manufacturer?.name || 'Unknown',
      activityHistory: device.deviceActivities.length
        ? device.deviceActivities.map((activity) => ({
            performedBy: activity.user
              ? `${activity.user.firstName} ${activity.user.lastName}`
              : 'Unknown',
            activityType: activity.activityType.name,
            description: activity.description || 'No description',
            timestamp: activity.createdAt,
          }))
        : 'No history available',
    };
  } catch (error) {
    throw new Error(`Error fetching device history: ${error.message}`);
  }
};

const updateDeviceCondition = async (
  deviceId,
  deviceConditionId,
  userId = null,
) => {
  return await prisma.$transaction(async (tx) => {
    const device = await tx.device.findUnique({
      where: { id: Number(deviceId) },
      include: { deviceCondition: true },
    });

    if (!device) throw new Error('Device not found');

    const newCondition = await tx.deviceCondition.findUnique({
      where: {
        id: Number(deviceConditionId),
        status: true,
      },
    });

    if (!newCondition) throw new Error('Invalid device condition');

    if (device.deviceConditionId === newCondition.id) {
      return {
        unchanged: true,
        device: {
          id: device.id,
          serialNumber: device.serialNumber,
          condition: device.deviceCondition,
        },
      };
    }

    const updatedDevice = await tx.device.update({
      where: { id: Number(deviceId) },
      data: {
        deviceConditionId: newCondition.id,
        lastUpdatedBy: Number(userId),
      },
      include: { deviceCondition: true },
    });

    return {
      device: {
        id: updatedDevice.id,
        serialNumber: updatedDevice.serialNumber,
        condition: updatedDevice.deviceCondition,
      },
    };
  });
};

const deleteDevice = async (id) => {
  const device = await prisma.device.findUnique({
    where: { id: Number(id) },
  });

  if (device.assignedUser && device.assignedUser.trim() !== '') {
    return {
      status: false,
      message: 'Cannot delete a device that is assigned to a user.',
    };
  }

  await prisma.deviceActivity.updateMany({
    where: { deviceId: Number(id) },
    data: { deletedAt: new Date() },
  });

  return await prisma.device.update({
    where: { id: Number(id) },
    data: { deletedAt: new Date() },
  });
};

const getAllDevices = async (
  page = 1,
  limit = 10,
  keyword = '',
  manufacturer = '',
  deviceType = '',
  deviceCondition = '',
) => {
  const whereClause = {
    deletedAt: null,
    ...(keyword && {
      serialNumber: {
        contains: keyword,
        mode: 'insensitive',
      },
    }),
    ...(manufacturer && {
      manufacturer: {
        name: {
          equals: manufacturer,
          mode: 'insensitive',
        },
      },
    }),
    ...(deviceCondition && {
      deviceCondition: {
        name: {
          equals: deviceCondition,
          mode: 'insensitive',
        },
      },
    }),
    ...(deviceType && {
      deviceType: {
        name: {
          equals: deviceType,
          mode: 'insensitive',
        },
      },
    }),
  };

  return prisma.$transaction([
    prisma.device.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      where: whereClause,
      include: {
        manufacturer: true,
        deviceCondition: true,
        deviceStatus: true,
        deviceActivities: true,
        deviceType: true,
      },
    }),
    prisma.device.count({
      where: whereClause,
    }),
  ]);
};

const getDeviceById = async (id) => {
  return await prisma.device.findUnique({
    where: { id: Number(id) },
    include: {
      manufacturer: true,
      deviceCondition: true,
      deviceStatus: true,
      deviceActivities: true,
      deviceType: true,
    },
  });
};

const getDeviceCountByType = async (page = 1, limit = 10, filters = {}) => {
  try {
    const { deviceTypeId } = filters;
    const data = await prisma.deviceType.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        id: deviceTypeId ? Number(deviceTypeId) : undefined,
      },
      select: {
        name: true,
        low_stock_limit: true,
        _count: {
          select: {
            devices: {
              where: { deletedAt: null },
            },
          },
        },
        devices: {
          where: { deletedAt: null },
          select: {
            deviceStatusId: true,
            deviceConditionId: true,
          },
        },
      },
      orderBy: { devices: { _count: 'desc' } },
    });

    if (!Array.isArray(data)) {
      throw new Error('deviceType.findMany() did not return an array');
    }

    const availableStatus = await prisma.deviceStatus.findUnique({
      where: { name: 'available' },
    });
    const assignedStatus = await prisma.deviceStatus.findUnique({
      where: { name: 'assigned' },
    });
    const brokenCondition = await prisma.deviceCondition.findUnique({
      where: { name: 'Broken' },
    });
    const lostCondition = await prisma.deviceCondition.findUnique({
      where: { name: 'Lost' },
    });
    const retiredCondition = await prisma.deviceCondition.findUnique({
      where: { name: 'Retired' },
    });

    const total = await prisma.deviceType.count({
      where: {
        id: deviceTypeId ? Number(deviceTypeId) : undefined,
      },
    });

    const formattedData = data.map((r) => {
      const availableCount = r.devices.filter(
        (device) => device.deviceStatusId === availableStatus?.id,
      ).length;

      const assignedCount = r.devices.filter(
        (device) => device.deviceStatusId === assignedStatus?.id,
      ).length;

      const brokenCount = r.devices.filter(
        (device) => device.deviceConditionId === brokenCondition?.id,
      ).length;

      const lostCount = r.devices.filter(
        (device) => device.deviceConditionId === lostCondition?.id,
      ).length;

      const retiredCount = r.devices.filter(
        (device) => device.deviceConditionId === retiredCondition?.id,
      ).length;

      return {
        deviceType: r.name,
        low_stock_limit: r.low_stock_limit ?? 10,
        count: r._count.devices,
        availableCount,
        assignedCount,
        brokenCount,
        lostCount,
        retiredCount,
      };
    });

    return {
      total,
      page,
      limit,
      data: formattedData,
    };
  } catch (error) {
    throw new Error('Failed to fetch device count');
  }
};

export default {
  createDevice,
  updateDevice,
  updateDeviceCondition,
  deleteDevice,
  getAllDevices,
  getDeviceById,
  getDeviceHistoryBySerial,
  getDeviceCountByType,
};
