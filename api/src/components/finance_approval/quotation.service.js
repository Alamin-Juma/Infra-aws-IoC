import { PrismaClient } from '@prisma/client';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '../../constants/table.constants.js';
import {
  PurchaseOrderStatus,
  QuotationStatus,
} from '../../constants/status.constants.js';

const prisma = new PrismaClient();

const getAllQuotations = (
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  keyword,
  status,
) => {
  const where = {
    ...(keyword && {
      quotationId: {
        contains: keyword,
        mode: 'insensitive',
      },
    }),
    ...(status && { status }),
  };

  return prisma.$transaction([
    prisma.quotation.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      where,
      select: {
        id: true,
        quotationId: true,
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        totalAmount: true,
        status: true,
        lastUpdatedById: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.quotation.count({ where }),
  ]);
};

const getQuotationById = async (id) => {
  return await prisma.quotation.findUnique({
    where: { id: Number(id) },
    include: {
      vendor: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          physicalAddress: true,
        },
      },
      submittedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      lastUpdatedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      lineItems: {
        select: {
          deviceType: {
            select: {
              id: true,
              name: true,
            },
          },
          specification: true,
          justification: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          expectedDeliveryDate: true,
        },
      },
    },
  });
};

const createPurchaseOrder = async (quotationId) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: parseInt(quotationId) },
      include: {
        lastUpdatedBy: true,
        vendor: true,
        lineItems: true,
      },
    });

    if (!quotation) {
      throw new Error('Quotation not found.');
    }

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        poNumber: `PO-${Date.now()}`,
        totalAmount: quotation.totalAmount,
        status: PurchaseOrderStatus.Pending,
        createdByUser: {
          connect: { id: quotation.lastUpdatedById },
        },
        vendor: {
          connect: { id: quotation.vendor.id },
        },
        items: {
          create: quotation.lineItems.map((item) => ({
            deviceTypeId: item.deviceTypeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            specification: item.specification,
            expectedDeliveryDate: item.expectedDeliveryDate,
          })),
        },
      },
    });

    return purchaseOrder;
  } catch (error) {
    throw new Error('Failed to create purchase order.');
  }
};

// Update the status of a quotation
const updateQuotationStatus = async (
  id,
  status,
  lastUpdatedById,
  rejectionReason,
) => {
  try {
    const validStatuses = Object.values(QuotationStatus);
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    const existingQuotation = await prisma.quotation.findUnique({
      where: { id: Number(id) },
    });

    if (!existingQuotation) {
      throw new Error('Quotation not found.');
    }

    if (status === QuotationStatus.Rejected && !rejectionReason) {
      throw new Error('Rejection reason is required for rejected quotations.');
    }

    const updatedQuotation = await prisma.quotation.update({
      where: { id: parseInt(id) },
      data: {
        status: status,
        lastUpdatedById: lastUpdatedById,
        rejectionReason:
          status === QuotationStatus.Rejected ? rejectionReason : null,
      },
    });

    if (!updatedQuotation) {
      throw new Error('Failed to update quotation status.');
    }

    let purchaseOrder = null;

    if (status === QuotationStatus.Approved) {
      purchaseOrder = await createPurchaseOrder(updatedQuotation.id);

      if (!purchaseOrder) {
        throw new Error('Failed to create purchase order.');
      }
    }

    return { updatedQuotation, purchaseOrder };
  } catch (error) {
    throw new Error(
      'Failed to update quotation status or create purchase order.',
    );
  }
};

export default {
  getAllQuotations,
  getQuotationById,
  updateQuotationStatus,
  createPurchaseOrder,
};
