import { PrismaClient } from '@prisma/client';
import { ProcurementRequestStatus } from '@prisma/client';
import config from '../../configs/app.config.js';
import { AppError } from '../../middleware/errorHandler.js';
import { sendProcurementRequestEmail } from '../../emails/procurementRequestEmail.js';

const prisma = new PrismaClient();

export const updateProcurementRequestByID = async ({
  id,
  action,
  comment,
  baseUrl,
}) => {
  const numericId = Number(id);

  const updatedData = {
    status: action,
    ...(action === ProcurementRequestStatus.Approved && {
      approvalReason: comment,
    }),
    ...(action === ProcurementRequestStatus.Rejected && {
      rejectionReason: comment,
    }),
    ...(action === ProcurementRequestStatus.Pending && {
      moreInfo: comment,
    }),
  };

  return prisma.$transaction(async (tx) => {
    const [updatedRequest] = await Promise.all([
      tx.procurementRequest.update({
        where: { id: numericId },
        data: updatedData,
        include: {
          CreatedBy: true,
        },
      }),
      tx.procurementRequestItem.updateMany({
        where: { procurementRequestId: numericId },
        data: { status: action },
      }),
    ]);

    try {
      await sendProcurementRequestEmail(
        updatedRequest,
        action.toLowerCase(),
        comment,
        baseUrl,
      );
    } catch {
      throw new AppError(
        'SERVER_ERROR',
        'An error occurred while sending the email',
      );
    }

    return updatedRequest;
  });
};

export const getProcurementRequests = async ({
  page = config.PAGE,
  limit = config.PAGE_LIMIT,
  ...query
}) => {
  const parsedLimit = Math.max(1, parseInt(limit) || 10);
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const skip = (parsedPage - 1) * parsedLimit;
  let where = {};
  if (query.status) {
    where.status = query.status;
  }

  const [data, total] = await Promise.all([
    prisma.procurementRequest.findMany({
      where,
      skip,
      take: parsedLimit,
      include: {
        procurementRequestItems: {
          select: {
            id: true,
            quantity: true,
            specification: true,
            deviceType: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.procurementRequest.count({ where }),
  ]);

  return {
    data,
    pagination: {
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      limit: parsedLimit,
    },
  };
};

export const createProcurementRequests = async (data, req, baseUrl) => {
  const {
    expectedDelivery,
    justification,
    procurementRequestItemIds,
    createdByID,
  } = data;

  return prisma.$transaction(async (tx) => {
    const items = await tx.procurementRequestItem.findMany({
      where: { id: { in: procurementRequestItemIds } },
    });

    if (items.length !== procurementRequestItemIds.length) {
      const foundIds = items.map((item) => item.id);
      const missingIds = procurementRequestItemIds.filter(
        (id) => !foundIds.includes(id),
      );

      throw new AppError(
        'VALIDATION_ERROR',
        `Invalid Procurement Request Item IDs: ${missingIds.join(', ')}`,
      );
    }

    const connectedItems = items.filter(
      (item) => item.procurementRequestId !== null,
    );
    if (connectedItems.length > 0) {
      const connectedIds = connectedItems.map((item) => item.id);
      throw new AppError(
        'CONFLICT',
        `Items with IDs ${connectedIds.join(
          ', ',
        )} are already connected to a procurement request`,
      );
    }

    const procurementRequest = await tx.procurementRequest.create({
      data: {
        expectedDelivery: new Date(expectedDelivery),
        justification,
        procurementRequestItems: {
          connect: procurementRequestItemIds.map((id) => ({ id })),
        },
        CreatedBy: { connect: { id: createdByID } },
      },
      include: {
        procurementRequestItems: true,
        CreatedBy: true,
      },
    });

    await tx.procurementRequestItem.updateMany({
      where: { id: { in: procurementRequestItemIds } },
      data: {
        status: ProcurementRequestStatus.Submitted,
        procurementRequestId: procurementRequest.id,
      },
    });

    try {
      await sendProcurementRequestEmail(procurementRequest, 'new', '', baseUrl);
    } catch {
      throw new AppError(
        'SERVER_ERROR',
        'An error occurred while sending the email',
      );
    }

    return procurementRequest;
  });
};

export const createProcurementRequestItem = async (data) => {
  const { deviceType, submittedBy, quantity, ...otherData } = data;

  return prisma.$transaction(async (tx) => {
    const [deviceTypeExists, userExists] = await Promise.all([
      tx.deviceType.findUnique({
        where: { id: deviceType?.id },
        select: { id: true },
      }),
      tx.user.findUnique({
        where: { id: submittedBy },
        select: { id: true },
      }),
    ]);

    if (!deviceTypeExists)
      throw new AppError('NOT_FOUND', 'Device Type not found');
    if (!userExists) throw new AppError('NOT_FOUND', 'User not found');

    return tx.procurementRequestItem.create({
      data: {
        ...otherData,
        quantity: Number(quantity),
        deviceType: { connect: { id: deviceType?.id } },
        submittedBy: { connect: { id: submittedBy } },
      },
    });
  });
};

export const getProcurementRequestsItems = async ({
  page = config.PAGE,
  limit = config.PAGE_LIMIT,
  status,
  deviceTypeId,
  email,
  search,
}) => {
  const parsedLimit = Math.max(1, parseInt(limit) || 10);
  const parsedPage = Math.max(1, parseInt(page) || 1);
  const skip = (parsedPage - 1) * parsedLimit;

  const where = {};
  if (status) where.status = status;
  if (deviceTypeId) where.deviceTypeId = deviceTypeId;

  if (email) {
    where.submittedBy = {
      email: { contains: email, mode: 'insensitive' },
    };
  }

  if (search) {
    where.OR = [
      { deviceType: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.procurementRequestItem.findMany({
      where,
      skip,
      take: parsedLimit,
      include: {
        deviceType: { select: { name: true } },
        submittedBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.procurementRequestItem.count({ where }),
  ]);

  return {
    data,
    pagination: {
      total,
      page: parsedPage,
      totalPages: Math.ceil(total / parsedLimit),
      limit: parsedLimit,
    },
  };
};

export const getProcurementRequestsItemByID = async ({ id }) => {
  const item = await prisma.procurementRequestItem.findUnique({
    where: { id },
    include: {
      deviceType: true,
      submittedBy: {
        select: { firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!item) {
    throw new AppError('NOT_FOUND', 'Procurement Request Item not found');
  }

  return item;
};

export const updateProcurementRequestItemByID = async ({ id, ...data }) => {
  const { deviceType, ...otherData } = data;

  return prisma.procurementRequestItem.update({
    where: { id },
    data: {
      ...otherData,
      ...(deviceType && { deviceType: { connect: { id: deviceType.id } } }),
    },
  });
};

export const deleteProcurementRequestItemByID = async (req, res, next) => {
  try {
    const { id } = req.params;
    const numberId = Number(id);
    const attachedRequest = await prisma.procurementRequest.findFirst({
      where: {
        procurementRequestItems: {
          some: { id: numberId },
        },
      },
      select: { id: true },
    });
    if (attachedRequest) {
      throw new AppError(
        'CONFLICT',
        'Cannot delete the procurement request item as it is attached to a procurement request',
      );
    }
    const deletedItem = await prisma.procurementRequestItem.delete({
      where: { id: numberId },
    });
    return deletedItem;
  } catch (error) {
    throw new AppError(
      'SERVER_ERROR',
      'An error occurred while deleting the procurement request item',
    );
  }
};

export const updateProcurementRequestID = async ({ id, ...data }) => {
  const numericId = Number(id);

  const existingRequest = await prisma.procurementRequest.findUnique({
    where: { id: numericId },
    include: {
      CreatedBy: true,
    },
  });

  if (!existingRequest) {
    throw new AppError('NOT_FOUND', 'Procurement Request not found');
  }

  const updatedRequest = await prisma.procurementRequest.update({
    where: { id: numericId },
    data,
    include: {
      CreatedBy: true,
    },
  });

  try {
    await sendProcurementRequestEmail(null, updatedRequest, 'updated');
  } catch {
    throw new AppError(
      'SERVER_ERROR',
      'An error occurred while sending the email',
    );
  }

  return updatedRequest;
};

export const createProcurementRequestAudit = async (data) => {};

export const getProcurementRequestByID = async ({ id }) => {
  const numericId = Number(id);
  const procurementRequest = await prisma.procurementRequest.findUnique({
    where: { id: numericId },
    include: {
      procurementRequestItems: {
        select: {
          id: true,
          quantity: true,
          specification: true,
          deviceType: { select: { name: true } },
        },
      },
      CreatedBy: true,
    },
  });

  if (!procurementRequest) {
    throw new AppError('NOT_FOUND', 'Procurement Request not found');
  }

  return procurementRequest;
};
