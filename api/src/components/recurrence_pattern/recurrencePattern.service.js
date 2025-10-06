import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';
import config from '../../configs/app.config.js';

const prisma = new PrismaClient();

export const getAll = async (
  page = parseInt(config.PAGE, 10),
  limit = parseInt(config.PAGE_LIMIT, 10),
) => {
  try {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.recurrencePattern.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.recurrencePattern.count(),
    ]);
    const meta={
      total:total,
      totalPages: Math.ceil(total/limit),
      page:page,
      limit:limit
    }
    return { data, meta };
  } catch (error) {
    throw new AppError(500, `Error fetching patterns: ${error.message}`);
  }
};

export const create = async (payload) => {
  const pattern = await prisma.recurrencePattern.findUnique({
    where: { name: payload.name },
  });
  if (pattern) {
    throw new AppError(400, 'pattern exists with the given name');
  }

  try {
    return await prisma.recurrencePattern.create({
      data: {
        ...payload,
        isActive:true
      },
    });
  } catch (error) {
    throw new AppError(500, `Error creating pattern: ${error.message}`);
  }
};

export const update = async (id, payload) => {
  try {
    return await prisma.recurrencePattern.update({
      where: { id },
      data: payload,
    });
  } catch (error) {
    throw new AppError(500, `Error updating pattern: ${error.message}`);
  }
};
export const deletePattern = async (id) => {
  try {
    return await prisma.recurrencePattern.update({
      where: { id: id },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },
    });
  } catch (error) {
    throw new AppError(500, `Error deleting pattern: ${error.message}`);
  }
};

export const toggleStatus = async (id, isActive = true) => {
  const pattern = await prisma.recurrencePattern.findUnique({ where: { id } });
  if (!pattern) throw new AppError(404, 'pattern Not found');

  try {
    return await prisma.recurrencePattern.update({
      where: { id },
      data: { isActive: isActive },
    });
  } catch (error) {
    throw new AppError(500, `Error toggling pattern status: ${error.message}`);
  }
};
