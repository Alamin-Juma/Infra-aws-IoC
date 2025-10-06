import { describe, it, expect, vi, beforeEach } from 'vitest';
import requestTypeService from './requestTypes.service.js';
import { PrismaClient } from '@prisma/client';

// Mock Prisma client
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    requestType: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

describe('requestTypeService', () => {
  let prisma;

  beforeEach(() => {
    prisma = new PrismaClient();
    vi.clearAllMocks(); // Reset mocks before each test
  });

  describe('createRequestType', () => {
    it('should create a new request type', async () => {
      const mockData = { 
        name: 'new_request_type', 
        status: true, 
        authorizedRoles: [1], 
        label: 'New Request Type',
        restrict: true 
      };
      const mockRequestType = { id: 1, ...mockData };
      const mockCalledData = {
          data: {
            ...mockData,
            authorizedRoles: {
              create: [
                {
                  role: {
                    connect: { id: 1 }
                  }
                }
              ]
            }
          },
          include: {
            authorizedRoles: {
              include: { role: true }
            }
          }
      };
      
      prisma.requestType.create.mockResolvedValue(mockRequestType);

      const result = await requestTypeService.createRequestType(mockData);

      expect(result).toEqual(mockRequestType);
      expect(prisma.requestType.create).toHaveBeenCalledWith(mockCalledData);
    });

    it('should throw an error if creation fails', async () => {
      const mockData = { name: 'New Request Type', status: true, authorizedRoles: [1] };

      prisma.requestType.create.mockRejectedValue(new Error('Database error'));

      await expect(requestTypeService.createRequestType(mockData)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getAllRequestTypes', () => {
    it('should fetch all request types with pagination', async () => {
      const mockRequestTypes = [
        { id: 1, name: 'Request Type 1', status: true },
        { id: 2, name: 'Request Type 2', status: false },
      ];
      const mockTotalCount = 2;

      prisma.requestType.findMany.mockResolvedValue(mockRequestTypes);
      prisma.requestType.count.mockResolvedValue(mockTotalCount);

      const result = await requestTypeService.getAllRequestTypes(1, 10);

      expect(result).toEqual({
        data: mockRequestTypes,
        total: mockTotalCount,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      expect(prisma.requestType.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: {
        authorizedRoles: {
            include: {
              role: true
            },
          },
        },
      });
      expect(prisma.requestType.count).toHaveBeenCalled();
    });

    it('should throw an error if fetching request types fails', async () => {
      prisma.requestType.findMany.mockRejectedValue(new Error('Database error'));

      await expect(requestTypeService.getAllRequestTypes(1, 10)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getRequestTypeById', () => {
    it('should fetch a request type by ID', async () => {
      const mockRequestType = { id: 1, name: 'Request Type 1', status: true };

      prisma.requestType.findUnique.mockResolvedValue(mockRequestType);

      const result = await requestTypeService.getRequestTypeById(1);

      expect(result).toEqual(mockRequestType);
      expect(prisma.requestType.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw an error if request type is not found', async () => {
      prisma.requestType.findUnique.mockResolvedValue(null);

      await expect(requestTypeService.getRequestTypeById(1)).resolves.toBeNull();
    });

    it('should throw an error if fetching request type fails', async () => {
      prisma.requestType.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(requestTypeService.getRequestTypeById(1)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('updateRequestType', () => {
    it('should update a request type by ID', async () => {
      const mockData = { name: 'Updated Request Type', status: false, authorizedRoles: [1] };
      const mockRequestType = { id: 1, ...mockData };

      prisma.requestType.update.mockResolvedValue(mockRequestType);

      const result = await requestTypeService.updateRequestType(1, mockData);

      expect(result).toEqual(mockRequestType);
      expect(prisma.requestType.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          authorizedRoles: {
            create: [
              {
                role: {
                  connect: { id: 1 }
                }
              }
            ],
            deleteMany: {}
          },
          name: 'Updated Request Type',
          status: false
        },
        include: {
          authorizedRoles: {
            include: { role: true }
          }
        }
      });
    });

    it('should throw an error if updating request type fails', async () => {
      const mockData = { name: 'Updated Request Type', status: false, authorizedRoles: [] };

      prisma.requestType.update.mockRejectedValue(new Error('Database error'));

      await expect(requestTypeService.updateRequestType(1, mockData)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('deleteRequestType', () => {
    it('should delete a request type by ID', async () => {
      const mockRequestType = { id: 1, name: 'Request Type 1', status: true };

      prisma.requestType.delete.mockResolvedValue(mockRequestType);

      const result = await requestTypeService.deleteRequestType(1);

      expect(result).toEqual(mockRequestType);
      expect(prisma.requestType.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw an error if deleting request type fails', async () => {
      prisma.requestType.delete.mockRejectedValue(new Error('Database error'));

      await expect(requestTypeService.deleteRequestType(1)).rejects.toThrow(
        'Database error'
      );
    });
  });
});
