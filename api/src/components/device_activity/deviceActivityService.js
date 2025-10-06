import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all ActivityTypes with pagination
export const getAllActivityTypes = async (page = 1, limit = 10) => {
  // Validate page and limit
  if (page < 1 || limit < 1) {
    throw new Error('Page and limit must be positive integers.');
  }

  const [activityTypes, totalCount] = await prisma.$transaction([
    prisma.activityType.findMany({
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.activityType.count(),
  ]);

  return {
    data: activityTypes,
    total: totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
};

// Get a single ActivityType by ID
export const getActivityTypeById = async (id) => {
  const activityType = await prisma.activityType.findUnique({
    where: { id },
  });

  if (!activityType) {
    throw new Error('ActivityType not found');
  }

  return activityType;
};

// Create a new ActivityType
export const createActivityType = async ({ name, status = true, lastUpdatedBy }) => {
  const newActivityType = await prisma.activityType.create({
    data: {
      name,
      status,
      lastUpdatedBy,
    },
  });

  return newActivityType;
};

// Update an existing ActivityType
export const updateActivityType = async (id, { name, status, lastUpdatedBy }) => {
  const updatedActivityType = await prisma.activityType.update({
    where: { id },
    data: {
      name,
      status,
      lastUpdatedBy,
    },
  });

  return updatedActivityType;
};

// Delete an ActivityType
export const deleteActivityType = async (id) => {
  await prisma.activityType.delete({
    where: { id },
  });
};
