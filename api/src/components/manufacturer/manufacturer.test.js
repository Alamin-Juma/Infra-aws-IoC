import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import manufacturerService from './manufacturer.service';

// Mock PrismaClient
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    deviceManufacturer: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

const prisma = new PrismaClient();

describe('Manufacturer Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllManufacturers', () => {
    it('should return manufacturers with pagination and total count', async () => {
      const mockManufacturers = [
        { id: 1, name: 'Manufacturer 1', status: 'ACTIVE', createdAt: new Date(), updatedAt: new Date() },
      ];
      const mockCount = 15;

      prisma.$transaction.mockResolvedValue([mockManufacturers, mockCount]);

      const result = await manufacturerService.getAllManufacturers(2, 5);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.deviceManufacturer.findMany).toHaveBeenCalledWith({
        skip: 5, // (2-1)*5
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(prisma.deviceManufacturer.count).toHaveBeenCalled();
      expect(result).toEqual([mockManufacturers, mockCount]);
    });

    it('should use default pagination values when not provided', async () => {
      await manufacturerService.getAllManufacturers();

      expect(prisma.deviceManufacturer.findMany).toHaveBeenCalledWith({
        skip: 0, // (1-1)*10
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: expect.any(Object),
      });
    });
  });

  describe('createManufacturer', () => {
    it('should create a new manufacturer', async () => {
      const mockData = { name: 'New Manufacturer', status: 'ACTIVE' };
      const mockResult = { id: 1, ...mockData };

      prisma.deviceManufacturer.create.mockResolvedValue(mockResult);

      const result = await manufacturerService.createManufacturer(mockData);

      expect(prisma.deviceManufacturer.create).toHaveBeenCalledWith({
        data: mockData,
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteManufacturer', () => {
    it('should delete a manufacturer by id', async () => {
      const mockId = '1';
      const mockResult = { id: 1, name: 'Deleted Manufacturer' };

      prisma.deviceManufacturer.delete.mockResolvedValue(mockResult);

      const result = await manufacturerService.deleteManufacturer(mockId);

      expect(prisma.deviceManufacturer.delete).toHaveBeenCalledWith({
        where: { id: 1 }, // Number('1')
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getManufacturerByName', () => {
    it('should find a manufacturer by name (case-insensitive)', async () => {
      const mockName = 'Test Manufacturer';
      const mockResult = { id: 1, name: mockName };

      prisma.deviceManufacturer.findFirst.mockResolvedValue(mockResult);

      const result = await manufacturerService.getManufacturerByName(mockName);

      expect(prisma.deviceManufacturer.findFirst).toHaveBeenCalledWith({
        where: {
          name: {
            equals: mockName,
            mode: 'insensitive',
          },
        },
      });
      expect(result).toEqual(mockResult);
    });

    it('should return null when manufacturer not found', async () => {
      prisma.deviceManufacturer.findFirst.mockResolvedValue(null);

      const result = await manufacturerService.getManufacturerByName('Non-existent');

      expect(result).toBeNull();
    });
  });

  describe('updateManufacturer', () => {
    it('should update a manufacturer by id', async () => {
      const mockId = '1';
      const mockData = { name: 'Updated Manufacturer', status: 'INACTIVE' };
      const mockResult = { id: 1, ...mockData };

      prisma.deviceManufacturer.update.mockResolvedValue(mockResult);

      const result = await manufacturerService.updateManufacturer(mockId, mockData);

      expect(prisma.deviceManufacturer.update).toHaveBeenCalledWith({
        where: { id: 1 }, // Number('1')
        data: mockData,
      });
      expect(result).toEqual(mockResult);
    });
  });
});
