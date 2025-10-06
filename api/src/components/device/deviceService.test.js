import { describe, it, expect, vi, beforeEach } from 'vitest';
import deviceService from './deviceService'; 
import { PrismaClient } from '@prisma/client';

vi.mock('@prisma/client', () => {
  const mockPrisma = {
    device: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
    },
    deviceType: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    deviceManufacturer: {
      findUnique: vi.fn(),
    },
    deviceCondition: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    deviceStatus: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    deviceActivity: {
      updateMany: vi.fn(),
    },
    $transaction: vi.fn((cb) => cb(mockPrisma)),
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

const prisma = new PrismaClient();

describe('Device Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDevice', () => {
    it('should create a device successfully', async () => {
      prisma.deviceType.findUnique.mockResolvedValue({ id: 1 });
      prisma.deviceManufacturer.findUnique.mockResolvedValue({ id: 1 });
      prisma.deviceCondition.findFirst.mockResolvedValue({ id: 1, name: 'Good' });
      prisma.deviceStatus.findFirst.mockResolvedValue({ id: 1, name: 'Available' });
      prisma.device.create.mockResolvedValue({ id: 1, serialNumber: 'ABC123' });

      const result = await deviceService.createDevice({
        serialNumber: 'ABC123',
        deviceTypeId: 1,
        manufacturerId: 1,
        deviceSpecifications: 100,
        specifications: { key: 'value' },
      });

      expect(result).toHaveProperty('id', 1);
      expect(prisma.device.create).toHaveBeenCalled();
    });

    it('should throw an error if required fields are missing', async () => {
      await expect(deviceService.createDevice({
        serialNumber: 'ABC123',
        manufacturerId: 1,
        deviceSpecifications: 100,
      })).rejects.toThrow('Device type and manufacturer are required.');
    });
  });

  describe('updateDevice', () => {
    it('should update an existing device', async () => {
      prisma.device.findUnique
        .mockResolvedValueOnce({ id: 1, serialNumber: 'ABC123' }) // Existing device check
        .mockResolvedValueOnce(null); // No duplicate serial number

      prisma.device.update.mockResolvedValue({ id: 1, serialNumber: 'DEF456' });

      const result = await deviceService.updateDevice(1, { serialNumber: 'DEF456' });
      
      expect(result).toHaveProperty('serialNumber', 'DEF456');
      expect(prisma.device.update).toHaveBeenCalled();
    });

    it('should throw an error if the device does not exist', async () => {
      prisma.device.findUnique.mockResolvedValue(null);
      await expect(deviceService.updateDevice(99, { serialNumber: 'XYZ789' }))
        .rejects.toThrow('Device with ID 99 not found.');
    });

    it('should throw an error if the new serial number already exists', async () => {
      prisma.device.findUnique
        .mockResolvedValueOnce({ id: 1, serialNumber: 'ABC123' }) // Existing device check
        .mockResolvedValueOnce({ id: 2, serialNumber: 'DEF456' }); // Duplicate serial number found

      await expect(deviceService.updateDevice(1, { serialNumber: 'DEF456' }))
        .rejects.toThrow('Device with serial number DEF456 already exists');
    });
});


  describe('deleteDevice', () => {
    it('should soft delete a device', async () => {
      prisma.device.findUnique.mockResolvedValue({ id: 1, assignedUser: '' });
      prisma.device.update.mockResolvedValue({ id: 1, deletedAt: new Date() });

      const result = await deviceService.deleteDevice(1);
      expect(result).toHaveProperty('deletedAt');
      expect(prisma.device.update).toHaveBeenCalled();
    });
  });
});
