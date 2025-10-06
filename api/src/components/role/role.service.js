import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';
import { attachAuditLogger } from '../audit_log/auditLog.service.js';

const prisma = new PrismaClient();

const getRoles = async (page, limit, search, status) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive',
    };
  }
  if (status !== '') {
    where.status = status === 'true';
  }

  const [roles, totalRoles] = await prisma.$transaction([
    prisma.role.findMany({
      skip,
      take: limit,
      include: {
        rolePermissions: {
          include: {
            permission: {
              select: {
                id: true,
                name: true,
                routeName: true,
              },
            },
          },
        },
      },
      where,
    }),
    prisma.role.count(),
  ]);

  return {
    roles,
    total: totalRoles,
    page,
    totalPages: Math.ceil(totalRoles / limit),
  };
};

const getRoleById = (id) => {
  return prisma.role.findUnique({
    where: { id: Number(id) },
    include: {
      rolePermissions: {
        include: {
          permission: {
            select: {
              id: true,
              name: true,
              routeName: true,
            },
          },
        },
      },
    },
  });
};

const createRole = async (data, user) => {
  const loggedPrismaClient = attachAuditLogger(prisma, user);
  const { permissions, ...roleData } = data;
  const existingRole = await loggedPrismaClient.role.findFirst({
    where: {
      name: {
        equals: data.roleName.trim(),
        mode: 'insensitive',
      },
    },
  });

  if (existingRole) {
    throw new AppError('CONFLICT', 'Role already exists.');
  }

  return await loggedPrismaClient.$transaction(async (tx) => {
    const createdRole = await tx.role.create({
      data: {
        name: roleData.roleName,
      },
    });
    if (permissions?.length > 0) {
      await tx.rolePermission.createMany({
        data: permissions.map((permissionId) => ({
          roleId: createdRole.id,
          permissionId: Number(permissionId),
        })),
      });
    }

    return createdRole;
  });
};

const updateRole = async (id, data, user) => {
  const loggedPrismaClient = attachAuditLogger(prisma, user);
  const roleId = Number(id);

  const role = await loggedPrismaClient.role.findUnique({
    where: { id: roleId },
    include: { rolePermissions: true },
  });

  if (!role) {
    throw new AppError('NOT_FOUND', 'Role not found.');
  }

  const { permissions = [], ...roleData } = data;
  return await loggedPrismaClient.$transaction(async (tx) => {
    const updatedRole = await tx.role.update({
      where: { id: roleId },
      data: roleData,
    });

    const currentPermissionIds = role.rolePermissions.map(
      (rp) => rp.permissionId,
    );

    const permissionsToDetach = currentPermissionIds.filter(
      (pid) => !permissions.includes(pid),
    );

    if (permissionsToDetach.length) {
      await tx.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId: { in: permissionsToDetach },
        },
      });
    }

    const permissionsToAttach = permissions.filter(
      (pid) => !currentPermissionIds.includes(pid),
    );

    if (permissionsToAttach.length) {
      await tx.rolePermission.createMany({
        data: permissionsToAttach.map((permissionId) => ({
          roleId,
          permissionId: Number(permissionId),
        })),
        skipDuplicates: true,
      });
    }

    const attachedPermissions = await tx.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: {
          select: {
            id: true,
            name: true,
            routeName: true,
          },
        },
      },
    });

    return { updatedRole, permissions: attachedPermissions };
  });
};

export const deleteRole = async (id) => {
  const numericId = Number(id);

  return await prisma.$transaction(async (tx) => {
    const role = await tx.role.findUnique({
      where: { id: numericId },
      select: { name: true },
    });

    if (!role) {
      throw new AppError('NOT_FOUND', 'Role not found.');
    }

    const userCount = await tx.user.count({
      where: { roleName: role.name },
    });

    if (userCount > 0) {
      throw new AppError(
        'CONFLICT',
        'Cannot delete a role currently assigned to users.',
      );
    }

    await tx.rolePermission.deleteMany({
      where: { roleId: numericId },
    });

    return await tx.role.delete({
      where: { id: numericId },
    });
  });
};

export const toggleRoleStatus = async (id) => {
  const role = await prisma.role.findUnique({
    where: { id },
    include: { users: true },
  });

  if (!role) {
    throw new AppError('NOT_FOUND', 'Role not found.');
  }

  // Prevent disabling if users are assigned
  if (role.status && role.users.length > 0) {
    throw new AppError(
      'CONFLICT',
      'Cannot disable a role currently assigned to users.',
    );
  }

  // Toggle the role status
  const updatedRole = await prisma.role.update({
    where: { id },
    data: { status: !role.status },
  });

  return updatedRole;
};

export const getAllPermissionsSerivce = async (page = 1, limit = 10) => {
  const skip = Math.max(0, (page - 1) * limit);
  const [permissions, totalPermissions] = await prisma.$transaction([
    prisma.permission.findMany({
      skip: Number(skip),
      take: Number(limit),
    }),
    prisma.permission.count(),
  ]);

  return {
    permissions,
    total: totalPermissions,
    page,
    totalPages: Math.ceil(totalPermissions / limit),
  };
};

export const getPermissionsByRoleId = async (id) => {
  return prisma.permission.findMany({
    where: {
      rolePermissions: {
        some: {
          roleId: id
        }
      }
    },
    select: {
      name: true
    }
  });
};

export default {
  createRole,
  getRoles,
  getRoleById,
  toggleRoleStatus,
  updateRole,
  deleteRole,
  getAllPermissionsSerivce,
  getPermissionsByRoleId,
};
