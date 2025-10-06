import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';
import { quotationSchema } from './quotationValidation.js';  
import config from '../../configs/app.config.js';
import { sendQuotationEmail } from '../../emails/quotationEmail.js';

const prisma = new PrismaClient();

const getAllQuotations = async (
  page = parseInt(config.PAGE, 10),
  limit = parseInt(config.PAGE_LIMIT, 10),
  search = ""
) => {
  
  const whereClause = search
  ? {
      quotationId: {
        contains: search,
        mode: "insensitive",
      },
    }
  : {};

  try {
    const [quotations, total] = await prisma.$transaction([
      prisma.quotation.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          quotationId: true,
          vendor: {
            select: { name: true },
          },
          submittedBy: {
            select: { firstName: true, lastName: true },
          },
          procurementRequest: {
            select: {
              id: true,
              justification: true,
              expectedDelivery: true,
            },
          },
          totalAmount: true,
          status: true,
          rejectionReason: true,
          createdAt: true,
          updatedAt: true,
          lineItems: {
            select: {
              deviceType: { select: { name: true } },
              quantity: true,
              unitPrice: true,
              totalPrice: true,
              specification: true,
              justification: true,
              expectedDeliveryDate: true,
            },
          },
        },
      }),
      prisma.quotation.count({ where: whereClause }),
    ]);

    return { quotations, total };
  } catch (error) {
    throw new AppError(500, `Error fetching quotations: ${error.message}`);
  }
};


const createQuotation = async (data) => {
  try {
    await quotationSchema.validate(data.body, { abortEarly: false });

    const { vendorId, submittedById, procurementRequestId, totalAmount, status, lineItems } = data.body;

    const vendorExists = await prisma.vendor.findUnique({ where: { id: Number(vendorId) } });
    if (!vendorExists) {
      throw new AppError(404, `Vendor with ID ${vendorId} not found.`);
    }

    const userExists = await prisma.user.findUnique({ where: { id: Number(submittedById) } });
    if (!userExists) {
      throw new AppError(404, `User with ID ${submittedById} not found.`);
    }

    for (const [index, item] of lineItems.entries()) {
      const { deviceTypeId, quantity, unitPrice } = item;

      const deviceTypeExists = await prisma.deviceType.findUnique({ where: { id: Number(deviceTypeId) } });
      if (!deviceTypeExists) {
        throw new AppError(404, `Error in line item ${index + 1}: Device type with ID ${deviceTypeId} not found.`);
      }
    }

    const calculatedTotalAmount = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    if (calculatedTotalAmount !== totalAmount) {
      throw new AppError(400, "Total amount does not match the sum of line items.");
    }

    const quotation = await prisma.quotation.create({
      data: {
        quotationId: `QTN${Date.now()}`,
        vendorId: Number(vendorId),
        submittedById: Number(submittedById),
        procurementRequestId: procurementRequestId ? Number(procurementRequestId) : null,
        totalAmount,
        status: status || "Submitted",
        lineItems: {
          create: lineItems.map((item) => ({
            deviceTypeId: item.deviceTypeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            specification: item.specification,
            justification: item.justification,
            expectedDeliveryDate: item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate) : null,
          })),
        },
      },
      include: {
        vendor: true,
        submittedBy: true,
        procurementRequest: true,
        lineItems: {
          include: {
            deviceType: true
          }
        }
      }
    });

    try {
      const baseUrl = data.get('host')?.includes('localhost') ? config.FRONTEND_URL : config.FRONTEND_URL_PROD;
      await sendQuotationEmail(quotation, baseUrl);
     
    } catch {      
    }

    return quotation;
  } catch (error) {
    throw new AppError(400, error.message);
  }
};

const getQuotationById = async (id) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: Number(id) },
      include: {
        vendor: true,
        submittedBy: true,
        procurementRequest: {
          select: {
            id: true,
            justification: true,
            expectedDelivery: true,
          },
        },
        lineItems: {
          select: {
            deviceType: {
              select: {
                name: true,
              },
            },
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            specification: true,
            justification: true,
            expectedDeliveryDate: true,
          },
        },
        financeApproval: true,
        purchaseOrder: true,
      },
    });

    if (!quotation) {
      throw new AppError(404, `Quotation with ID ${id} not found.`);
    }

    return quotation;
  } catch (error) {
    throw new AppError(500, `Error fetching quotation by ID: ${error.message}`);
  }
};

const updateQuotation = async (id, data) => {
  try {
    await quotationSchema.validate(data, { abortEarly: false });

    const { vendorId, submittedById, totalAmount, status, lineItems, rejectionReason } = data;

    const existingQuotation = await prisma.quotation.findUnique({ where: { id: Number(id) } });
    if (!existingQuotation) {
      throw new AppError(404, `Quotation with ID ${id} not found.`);
    }

    if (vendorId) {
      const vendorExists = await prisma.vendor.findUnique({ where: { id: Number(vendorId) } });
      if (!vendorExists) {
        throw new AppError(404, `Vendor with ID ${vendorId} not found.`);
      }
    }

    if (submittedById) {
      const userExists = await prisma.user.findUnique({ where: { id: Number(submittedById) } });
      if (!userExists) {
        throw new AppError(404, `User with ID ${submittedById} not found.`);
      }
    }

    if (lineItems && lineItems.length > 0) {
      for (const item of lineItems) {
        const { deviceTypeId, quantity, unitPrice } = item;

        const deviceTypeExists = await prisma.deviceType.findUnique({ where: { id: Number(deviceTypeId) } });
        if (!deviceTypeExists) {
          throw new AppError(404, `Device type with ID ${deviceTypeId} not found.`);
        }
      }

      const calculatedTotalAmount = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      if (calculatedTotalAmount !== totalAmount) {
        throw new AppError(400, "Total amount does not match the sum of line items.");
      }
    }

    return prisma.quotation.update({
      where: { id: Number(id) },
      data: {
        vendorId: vendorId ? Number(vendorId) : undefined,
        submittedById: submittedById ? Number(submittedById) : undefined,
        procurementRequestId: data.procurementRequestId ? Number(data.procurementRequestId) : undefined,
        totalAmount: totalAmount !== undefined ? totalAmount : undefined,
        status: status !== undefined ? status : undefined,
        rejectionReason: rejectionReason !== undefined ? rejectionReason : undefined,
        lineItems: lineItems
          ? {
              deleteMany: {},
              create: lineItems.map((item) => ({
                deviceTypeId: item.deviceTypeId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.quantity * item.unitPrice,
                specification: item.specification,
                justification: item.justification,
                expectedDeliveryDate: item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate) : null,
              })),
            }
          : undefined,
      },
    });
  } catch (error) {
    throw new AppError(500, `Error updating quotation: ${error.message}`);
  }
};
export default {
  getAllQuotations,
  createQuotation,
  getQuotationById,
  updateQuotation,
};

