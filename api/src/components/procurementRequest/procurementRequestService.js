import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';
import config from '../../configs/app.config.js';

const prisma = new PrismaClient();

const getAllProcurementRequests = async (page = config.PAGE, limit = config.PAGE_LIMIT) => {
  try {
    return prisma.$transaction([
      prisma.procurementRequest.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          procurementRequestItems: { include: { deviceType: true } },
          CreatedBy: { select: { firstName: true, lastName: true, email: true } },
          quotations: { select: { id: true, status: true } },
        },
      }),
      prisma.procurementRequest.count(),
    ]);
  } catch (error) {
    throw new AppError(500, `Error fetching procurement requests: ${error.message}`);
  }
};

const getProcurementRequestById = async (id) => {
  try {
    const procurementRequest = await prisma.procurementRequest.findUnique({
      where: { id: Number(id) },
      include: {
        procurementRequestItems: { include: { deviceType: true } },
        CreatedBy: { select: { firstName: true, lastName: true } },
      },
    });

    if (!procurementRequest) {
      throw new AppError(404, `Procurement Request with ID ${id} not found.`);
    }

    return procurementRequest;
  } catch (error) {
    throw new AppError(500, `Error fetching procurement request by ID: ${error.message}`);
  }
};

const updateProcurementRequest = async (id, data) => {
  try {
    const { createdById, procurementRequestItems, justification, expectedDelivery, status } = data;

    const existingProcurementRequest = await prisma.procurementRequest.findUnique({
      where: { id: Number(id) },
    });

    if (!existingProcurementRequest) {
      throw new AppError(404, `Procurement Request with ID ${id} not found.`);
    }

    if (createdById) {
      const userExists = await prisma.user.findUnique({ where: { id: Number(createdById) } });
      if (!userExists) {
        throw new AppError(404, `User with ID ${createdById} not found.`);
      }
    }

    if (procurementRequestItems && procurementRequestItems.length > 0) {
      for (const item of procurementRequestItems) {
        const { deviceTypeId, quantity } = item;
        if (!deviceTypeId || !quantity) {
          throw new AppError(400, 'Each procurement request item must include deviceTypeId and quantity.');
        }

        const deviceTypeExists = await prisma.deviceType.findUnique({ where: { id: Number(deviceTypeId) } });
        if (!deviceTypeExists) {
          throw new AppError(404, `Device Type with ID ${deviceTypeId} not found.`);
        }
      }
    }

    return prisma.procurementRequest.update({
      where: { id: Number(id) },
      data: {
        justification: justification !== undefined ? justification : undefined,
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : undefined,
        status: status !== undefined ? status : undefined,
        createdById: createdById !== undefined ? Number(createdById) : undefined,
        procurementRequestItems: procurementRequestItems
          ? {
              deleteMany: {},
              create: procurementRequestItems.map((item) => ({
                deviceTypeId: item.deviceTypeId,
                quantity: item.quantity,
                specification: item.specification,
                submittedAt: item.submittedAt ? new Date(item.submittedAt) : null,
                deletedAt: item.deletedAt ? new Date(item.deletedAt) : null,
              })),
            }
          : undefined,
      },
      include: {
        procurementRequestItems: { include: { deviceType: true } },
      },
    });
  } catch (error) {
    throw new AppError(500, `Error updating procurement request: ${error.message}`);
  }
};

export default {
  getAllProcurementRequests,
  getProcurementRequestById,
  updateProcurementRequest,
};



