import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import deviceSpecService from './specification.service';

// Mock the PrismaClient
vi.mock('@prisma/client', () => {
  const PrismaClient = vi.fn();
  PrismaClient.prototype.deviceSpecification = {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    $queryRaw: vi.fn(),
  };
  PrismaClient.prototype.device = {
    findMany: vi.fn(),
  };
  return { PrismaClient };
});

const prisma = new PrismaClient();

describe('Device Specification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDeviceSpecification', () => {
    it('should create a new device specification', async () => {
      const mockData = {
        name: 'Screen Size',
        fieldType: 'number',
        selectOptions: null,
      };
      const userId = 'user123';
      const mockResult = { ...mockData, specification_id: 1, lastUpdatedBy: userId };

      prisma.deviceSpecification.create.mockResolvedValue(mockResult);

      const result = await deviceSpecService.createDeviceSpecification(mockData, userId);

      expect(prisma.deviceSpecification.create).toHaveBeenCalledWith({
        data: {
          name: mockData.name,
          fieldType: mockData.fieldType,
          selectOptions: mockData.selectOptions,
          lastUpdatedBy: userId,
        },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getAllDeviceSpecifications', () => {

    it('should throw error for invalid page or limit', async () => {
      await expect(deviceSpecService.getAllDeviceSpecifications(0, 10)).rejects.toThrow(
        'Page and limit must be positive integers.'
      );
      await expect(deviceSpecService.getAllDeviceSpecifications(1, -5)).rejects.toThrow(
        'Page and limit must be positive integers.'
      );
    });
  });

  describe('getDeviceSpecificationById', () => {
    it('should return a device specification by id', async () => {
      const mockSpec = {
        specification_id: 1,
        name: 'Processor',
        fieldType: 'text',
      };

      prisma.deviceSpecification.findUnique.mockResolvedValue(mockSpec);

      const result = await deviceSpecService.getDeviceSpecificationById(1);

      expect(prisma.deviceSpecification.findUnique).toHaveBeenCalledWith({
        where: { specification_id: 1 },
      });
      expect(result).toEqual(mockSpec);
    });

    it('should throw error if specification not found', async () => {
      prisma.deviceSpecification.findUnique.mockResolvedValue(null);

      await expect(deviceSpecService.getDeviceSpecificationById(999)).rejects.toThrow(
        'Device specification not found.'
      );
    });
  });

  describe('updateDeviceSpecification', () => {
    it('should update a device specification', async () => {
      const mockExistingSpec = {
        specification_id: 1,
        name: 'Old Name',
        fieldType: 'text',
      };
      const updateData = {
        name: 'New Name',
        fieldType: 'select',
        category: 'Performance',
        status: 'Active',
      };
      const mockUpdatedSpec = { ...mockExistingSpec, ...updateData };

      prisma.deviceSpecification.findUnique.mockResolvedValueOnce(mockExistingSpec);
      prisma.deviceSpecification.update.mockResolvedValue(mockUpdatedSpec);

      const result = await deviceSpecService.updateDeviceSpecification(1, updateData);

      expect(prisma.deviceSpecification.findUnique).toHaveBeenCalledWith({
        where: { specification_id: 1 },
      });
      expect(prisma.deviceSpecification.update).toHaveBeenCalledWith({
        where: { specification_id: 1 },
        data: updateData,
      });
      expect(result).toEqual(mockUpdatedSpec);
    });

    it('should throw error if specification to update not found', async () => {
      prisma.deviceSpecification.findUnique.mockResolvedValue(null);

      await expect(
        deviceSpecService.updateDeviceSpecification(999, { name: 'New Name' })
      ).rejects.toThrow('Device specification not found.');
    });
  });

  describe('deleteDeviceSpecification', () => {
    it('should delete a device specification', async () => {
      const mockSpec = {
        specification_id: 1,
        name: 'To Be Deleted',
        fieldType: 'text',
      };

      prisma.deviceSpecification.findUnique.mockResolvedValue(mockSpec);
      prisma.device.findMany.mockResolvedValue([]);
      prisma.deviceSpecification.delete.mockResolvedValue(mockSpec);

      const result = await deviceSpecService.deleteDeviceSpecification(1);

      expect(prisma.deviceSpecification.findUnique).toHaveBeenCalledWith({
        where: { specification_id: 1 },
      });
      expect(prisma.device.findMany).toHaveBeenCalledWith({
        where: {
          specifications: {
            path: ['$'],
            string_contains: mockSpec.name,
          },
        },
      });
      expect(prisma.deviceSpecification.delete).toHaveBeenCalledWith({
        where: { specification_id: 1 },
      });
      expect(result).toEqual(mockSpec);
    });

    it('should throw error if specification not found', async () => {
      prisma.deviceSpecification.findUnique.mockResolvedValue(null);

      await expect(deviceSpecService.deleteDeviceSpecification(999)).rejects.toThrow(
        'Device specification not found.'
      );
    });

    it('should throw error if specification is assigned to a device', async () => {
      const mockSpec = {
        specification_id: 1,
        name: 'Used Spec',
        fieldType: 'text',
      };
      const mockDevices = [{ device_id: 1, name: 'Device 1' }];

      prisma.deviceSpecification.findUnique.mockResolvedValue(mockSpec);
      prisma.device.findMany.mockResolvedValue(mockDevices);

      await expect(deviceSpecService.deleteDeviceSpecification(1)).rejects.toThrow(
        'Cannot delete the specification as it is currently assigned to a device.'
      );
    });
  });
});
