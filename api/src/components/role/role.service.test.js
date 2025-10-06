import { describe, test, expect, vi, beforeEach, afterEach, it } from 'vitest';
import { PrismaClient } from '@prisma/client';
import roleService from './role.service'; // Adjust the import path

// Mock Prisma Client
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    role: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    rolePermission: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    permission: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => {
      if (typeof callback === 'function') {
        return callback(prismaMock);
      }
      return callback;
    }),
  };
  return {
    PrismaClient: vi.fn(() => mockPrisma),
    default: { PrismaClient: vi.fn(() => mockPrisma) },
  };
});

const prismaMock = new PrismaClient();

describe('Role Service', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks before each test
  });

  describe('getRoleById', () => {
    it('should return a role by ID with permissions', async () => {
      const mockRole = {
        id: 1,
        name: 'Admin',
        rolePermissions: [
          {
            permission: {
              id: 1,
              name: 'Create User',
              routeName: 'user.create',
            },
          },
        ],
      };

      prismaMock.role.findUnique.mockResolvedValue(mockRole);

      const result = await roleService.getRoleById(1);

      expect(prismaMock.role.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
      expect(result).toEqual(mockRole);
    });

    it('should return null if role is not found', async () => {
      prismaMock.role.findUnique.mockResolvedValue(null);

      const result = await roleService.getRoleById(999);

      expect(result).toBeNull();
    });
  });

  describe('getAllPermissionsSerivce', () => {
    it('should return a list of permissions with pagination', async () => {
      const mockPermissions = [
        { id: 1, name: 'Create User', routeName: 'user.create' },
        { id: 2, name: 'Edit User', routeName: 'user.edit' },
      ];
      const totalPermissions = 2;

      prismaMock.$transaction.mockResolvedValue([
        mockPermissions,
        totalPermissions,
      ]);

      const result = await roleService.getAllPermissionsSerivce(1, 10);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.permission.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
      expect(prismaMock.permission.count).toHaveBeenCalled();
      expect(result).toEqual({
        permissions: mockPermissions,
        total: totalPermissions,
        page: 1,
        totalPages: 1,
      });
    });

    it('should handle default pagination values', async () => {
      const mockPermissions = [
        { id: 1, name: 'Create User', routeName: 'user.create' },
      ];
      const totalPermissions = 1;

      prismaMock.$transaction.mockResolvedValue([
        mockPermissions,
        totalPermissions,
      ]);

      await roleService.getAllPermissionsSerivce();

      expect(prismaMock.permission.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });
  });
});
