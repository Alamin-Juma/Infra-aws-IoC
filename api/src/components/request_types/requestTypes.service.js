import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new RequestType
const createRequestType = async (data) => {
  const { name, label, restrict, status, authorizedRoles } = data;

  return prisma.requestType.create({
    data: {
      name,
      label,
      restrict,
      status,
      authorizedRoles: {
        create: authorizedRoles.map((roleId) => ({
          role: { connect: { id: roleId } },
        })),
      },
    },
    include: {
      authorizedRoles: {
        include: {
          role: true,
        },
      },
    },
  });
};

// Get all RequestTypes
const getAllRequestTypes = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const [requestTypes, totalCount] = await Promise.all([
    prisma.requestType.findMany({
      skip: offset,
      take: limit,
      include: {
        authorizedRoles: {
          include: {
            role: true,
          },
        },
      },
    }),
    prisma.requestType.count(),
  ]);

  return {
    data: requestTypes,
    total: totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit),
  };
};

// Get a RequestType by ID
const getRequestTypeById = async (id) => {
  return prisma.requestType.findUnique({
    where: { id: Number(id) },
  });
};

const verifyUser = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: {
        select: { id: true },
      },
    },
  });

  if (!user) {
    return {
      status: 400,
      message:
        'Your email is not recognized in our system. Please contact IT support at itrack918@gmail.com for assistance.',
    };
  }
  try {
    const userRoleId = user.role.id;

    const requestTypes = await prisma.requestType.findMany({
      where: {
        OR: [
          { restrict: false },
          {
            restrict: true,
            authorizedRoles: {
              some: {
                roleId: userRoleId,
              },
            },
          },
        ],
      },
    });

    return {
      status: 200,
      data: requestTypes,
    };
  } catch (error) {
    throw new AppError(500, error);
  }
};

// Update a RequestType by ID
const updateRequestType = async (id, data) => {
  const { name, label, restrict, status, authorizedRoles } = data;
  return prisma.requestType.update({
    where: { id: Number(id) },
    data: {
      name,
      label,
      restrict,
      status,
      authorizedRoles: {
        deleteMany: {},
        create: authorizedRoles.map((roleId) => ({
          role: { connect: { id: roleId } },
        })),
      },
    },
    include: {
      authorizedRoles: {
        include: {
          role: true,
        },
      },
    },
  });
};

// Delete a RequestType by ID
const deleteRequestType = async (id) => {
  return prisma.requestType.delete({
    where: { id: Number(id) },
  });
};

export default {
  createRequestType,
  getAllRequestTypes,
  getRequestTypeById,
  updateRequestType,
  deleteRequestType,
  verifyUser,
};
