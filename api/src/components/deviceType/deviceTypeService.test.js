import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import deviceTypeService from './deviceTypeService';

// Mock the PrismaClient
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    $transaction: vi.fn(),
    deviceType: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mockPrisma),
  };
});

const prisma = new PrismaClient();

describe('Device Type Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllDeviceTypes', () => {
    it('should return paginated device types with descending createdAt order and device count', async () => {
      const mockDeviceTypes = [
        {
          id: 1,
          name: 'Smartphone',
          createdAt: new Date('2023-01-02'),
          low_stock_limit: 5,
          _count: { devices: 10 },
        },
        {
          id: 2,
          name: 'Tablet',
          createdAt: new Date('2023-01-01'),
          low_stock_limit: 5,
          _count: { devices: 3 },
        },
      ];
      const mockCount = 15;

      prisma.$transaction.mockResolvedValue([mockDeviceTypes, mockCount]);

      const result = await deviceTypeService.getAllDeviceTypes(2, 5);

      // Ensure correct query args including include._count.devices filter
      expect(prisma.deviceType.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              devices: {
                where: { deletedAt: null },
              },
            },
          },
        },
      });
      expect(prisma.deviceType.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockDeviceTypes,
        total: mockCount,
        page: 2,
        limit: 5,
        totalPages: 3,
      });
    });

    it('should throw error for invalid page or limit', async () => {
      await expect(deviceTypeService.getAllDeviceTypes(0, 10)).rejects.toThrow(
        'Page and limit must be positive integers.',
      );
      await expect(deviceTypeService.getAllDeviceTypes(1, -5)).rejects.toThrow(
        'Page and limit must be positive integers.',
      );
    });
  });

  describe('getDeviceTypeById', () => {
    it('should return a device type by id', async () => {
      const mockDeviceType = {
        id: 1,
        name: 'Laptop',
        specifications: '[]',
        low_stock_limit: 5,
      };

      prisma.deviceType.findFirst.mockResolvedValue(mockDeviceType);

      const result = await deviceTypeService.getDeviceTypeById(1);

      expect(prisma.deviceType.findFirst).toHaveBeenCalledWith({
        where: { id: 1, deletedAt: null },
      });
      expect(result).toEqual(mockDeviceType);
    });

    it('should return null if device type not found', async () => {
      prisma.deviceType.findFirst.mockResolvedValue(null);

      const result = await deviceTypeService.getDeviceTypeById(9999);
      expect(result).toBeNull();
    });
  });

  describe('createDeviceType', () => {
    const validDeviceTypeData = {
      name: ' Smartphone ',
      specifications: [{ name: 'Screen Size', value: '6.1"' }],
      status: 'Active',
      lastUpdatedBy: 'user123',
      low_stock_limit: 10,
    };

    it('should create a new device type with trimmed name and defaults', async () => {
      const mockCreatedDeviceType = {
        id: 1,
        name: 'Smartphone',
        specifications: JSON.stringify(validDeviceTypeData.specifications),
        low_stock_limit: 10,
        status: 'Active',
        lastUpdatedBy: 'user123',
      };

      prisma.deviceType.findFirst.mockResolvedValue(null);
      prisma.deviceType.create.mockResolvedValue(mockCreatedDeviceType);

      const result = await deviceTypeService.createDeviceType(validDeviceTypeData);

      expect(prisma.deviceType.findFirst).toHaveBeenCalledWith({
        where: {
          name: {
            equals: 'Smartphone',
            mode: 'insensitive',
          },
        },
      });
      expect(prisma.deviceType.create).toHaveBeenCalledWith({
        data: {
          name: 'Smartphone',
          specifications: JSON.stringify(validDeviceTypeData.specifications),
          lastUpdatedBy: 'user123',
          low_stock_limit: 10,
          status: 'Active',
        },
      });
      expect(result).toEqual(mockCreatedDeviceType);
    });

    it('should use default low_stock_limit if not provided', async () => {
      const data = { ...validDeviceTypeData, low_stock_limit: undefined };
      prisma.deviceType.findFirst.mockResolvedValue(null);
      prisma.deviceType.create.mockResolvedValue({
        ...data,
        low_stock_limit: 5,
      });

      const result = await deviceTypeService.createDeviceType(data);

      expect(result.low_stock_limit).toBe(5);
    });

    it('should throw error for empty name', async () => {
      await expect(
        deviceTypeService.createDeviceType({
          ...validDeviceTypeData,
          name: '   ',
        }),
      ).rejects.toThrow('Device type name cannot be empty.');
    });

    it('should throw error for non-string name', async () => {
      await expect(
        deviceTypeService.createDeviceType({
          ...validDeviceTypeData,
          name: 123,
        }),
      ).rejects.toThrow('Device type name is required and must be a string.');
    });

    it('should throw error for name exceeding 50 characters', async () => {
      await expect(
        deviceTypeService.createDeviceType({
          ...validDeviceTypeData,
          name: 'a'.repeat(51),
        }),
      ).rejects.toThrow('Device type name cannot exceed 50 characters.');
    });

    it('should throw error for duplicate name', async () => {
      prisma.deviceType.findFirst.mockResolvedValue({
        id: 1,
        name: 'Smartphone',
      });

      await expect(
        deviceTypeService.createDeviceType(validDeviceTypeData),
      ).rejects.toThrow(
        "A device type with the name 'Smartphone' already exists.",
      );
    });

    it('should handle empty specifications array', async () => {
      const deviceTypeData = { ...validDeviceTypeData, specifications: null };
      prisma.deviceType.findFirst.mockResolvedValue(null);
      prisma.deviceType.create.mockResolvedValue({
        id: 1,
        name: 'Smartphone',
        specifications: '[]',
        low_stock_limit: 5,
      });

      const result = await deviceTypeService.createDeviceType(deviceTypeData);

      expect(result.specifications).toBe('[]');
    });
  });

  describe('updateDeviceType', () => {
    const existingDeviceType = {
      id: 1,
      name: 'Old Device',
      specifications: '[]',
      status: 'Inactive',
      low_stock_limit: 5,
    };

    const validUpdateData = {
      name: ' New Device ',
      specifications: [{ name: 'Weight', value: '200g' }],
      lastUpdatedBy: 'user456',
      low_stock_limit: 15,
    };

    beforeEach(() => {
      prisma.deviceType.findUnique.mockResolvedValue(existingDeviceType);
    });

    it('should update device type with trimmed name and updated fields', async () => {
      const mockUpdatedDeviceType = {
        ...existingDeviceType,
        name: 'New Device',
        specifications: JSON.stringify(validUpdateData.specifications),
        low_stock_limit: 15,
        status: 'Active',
        lastUpdatedBy: 'user456',
      };

      prisma.deviceType.findFirst.mockResolvedValue(null);
      prisma.deviceType.update.mockResolvedValue(mockUpdatedDeviceType);

      const result = await deviceTypeService.updateDeviceType(1, validUpdateData);

      expect(prisma.deviceType.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prisma.deviceType.findFirst).toHaveBeenCalledWith({
        where: {
          name: {
            equals: 'New Device',
            mode: 'insensitive',
          },
          NOT: {
            id: 1,
          },
        },
      });
      expect(prisma.deviceType.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'New Device',
          specifications: JSON.stringify(validUpdateData.specifications),
          lastUpdatedBy: 'user456',
          low_stock_limit: 15,
        },
      });
      expect(result).toEqual(mockUpdatedDeviceType);
    });

    it('should allow update without changing name', async () => {
      const updateData = { ...validUpdateData, name: 'Old Device' };
      prisma.deviceType.update.mockResolvedValue(existingDeviceType);

      await deviceTypeService.updateDeviceType(1, updateData);

      // Should not check for duplicates when name hasn't changed
      expect(prisma.deviceType.findFirst).not.toHaveBeenCalled();
    });

    it('should use default low_stock_limit if not provided', async () => {
      const updateData = { ...validUpdateData, low_stock_limit: undefined };
      prisma.deviceType.findFirst.mockResolvedValue(null);
      prisma.deviceType.update.mockResolvedValue({
        ...existingDeviceType,
        name: 'New Device',
        low_stock_limit: 5,
      });

      const result = await deviceTypeService.updateDeviceType(1, updateData);

      expect(result.low_stock_limit).toBe(5);
    });

    it('should handle error during update', async () => {
      prisma.deviceType.update.mockRejectedValue(new Error('Database error'));

      await expect(
        deviceTypeService.updateDeviceType(1, validUpdateData),
      ).rejects.toThrow('Failed to update device type. Please try again.');
    });
  });

  describe('deleteDeviceType', () => {
    it('should delete device type when not in use', async () => {
      const mockDeviceType = {
        id: 1,
        name: 'Obsolete Device',
        devices: [],
      };

      prisma.deviceType.findUnique.mockResolvedValue(mockDeviceType);
      prisma.deviceType.delete.mockResolvedValue(mockDeviceType);

      const result = await deviceTypeService.deleteDeviceType(1);

      expect(prisma.deviceType.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { devices: true },
      });
      expect(prisma.deviceType.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockDeviceType);
    });

    it('should throw error if device type is in use', async () => {
      const mockDeviceType = {
        id: 1,
        name: 'Popular Device',
        devices: [{ id: 1, name: 'Device 1' }],
      };

      prisma.deviceType.findUnique.mockResolvedValue(mockDeviceType);

      await expect(deviceTypeService.deleteDeviceType(1)).rejects.toThrow(
        'This device type is in use and cannot be deleted.',
      );
    });
  });
});