import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('nodemailer', () => {
  const mockNodemailer = {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' })
    }))
  };
  return {
    default: mockNodemailer,
    createTransport: mockNodemailer.createTransport
  };
});

vi.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    device: {
      findFirst: vi.fn(),
    },
    externalRequest: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    ticketTrail: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    requestType: {
      findFirst: vi.fn(),
    },
    deviceType: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    deviceStatus: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(mockPrisma)),
  };

  return {
    PrismaClient: vi.fn(() => mockPrisma),
    PrismaClientKnownRequestError: class extends Error {
      constructor(message) {
        super(message);
        this.name = 'PrismaClientKnownRequestError';
      }
    },
    PrismaClientValidationError: class extends Error {
      constructor(message) {
        super(message);
        this.name = 'PrismaClientValidationError';
      }
    },
    default: {
      PrismaClient: vi.fn(() => mockPrisma),
      PrismaClientKnownRequestError: class extends Error {
        constructor(message) {
          super(message);
          this.name = 'PrismaClientKnownRequestError';
        }
      },
      PrismaClientValidationError: class extends Error {
        constructor(message) {
          super(message);
          this.name = 'PrismaClientValidationError';
        }
      }
    }
  };
});

vi.mock('./generateTicketId.js', () => ({
  default: vi.fn(() => 'TCK123456'),
}));

import externalRequestService from './externalRequest.service.js';

const mockPrisma = new (await import('@prisma/client')).PrismaClient();

describe('externalRequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchTickets', () => {
    it('should fetch tickets with pagination', async () => {
      const mockTickets = [
        {
          id: 1,
          ticketId: 'TCK123456',
          narration: 'Need access to the device',
          externalRequestId: 1,
          createdAt: '2023-10-10T12:00:00.000Z',
          updatedAt: '2023-10-10T12:00:00.000Z',
          externalRequest: {
            id: 1,
            deviceId: 1,
            userId: 1,
            requestTypeId: 1,
            deviceTypeId: 1,
            email: 'user@example.com',
            descriptions: 'Need access to the device',
            status: true,
            createdAt: '2023-10-10T12:00:00.000Z',
            updatedAt: '2023-10-10T12:00:00.000Z',
            lastUpdatedBy: null,
            user: {
              id: 1,
              firstName: 'John',
              lastName: 'Doe',
              email: 'user@example.com',
              roleName: 'employee',
            },
            device: {
              id: 1,
              deviceTypeId: 1,
              assignedUser: 'user@example.com',
            },
          },
        },
      ];

      mockPrisma.ticketTrail.findMany.mockResolvedValue(mockTickets);
      mockPrisma.ticketTrail.count.mockResolvedValue(10);

      const result = await externalRequestService.fetchTickets({}, 1, 10);

      expect(result).toEqual({
        tickets: mockTickets,
        totalCount: 10,
        currentPage: 1,
        totalPages: 1,
      });

      expect(mockPrisma.ticketTrail.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          externalRequest: {
            include: {
              user: true,
              device: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: 0,
        take: 10,
      });

      expect(mockPrisma.ticketTrail.count).toHaveBeenCalledWith({ where: {} });
    });

    it('should throw an error if fetching tickets fails', async () => {
      mockPrisma.ticketTrail.findMany.mockRejectedValue(new Error('Database error'));

      await expect(externalRequestService.fetchTickets({}, 1, 10)).rejects.toThrow(
        'Error fetching tickets: Database error'
      );
    });
  });

  describe('submitExternalRequest', () => {
    it('should create a new external request', async () => {
      const mockRequest = {
        email: 'test@example.com',
        requestType: 1,
        deviceTypeId: 1,
        description: 'Test request'
      };

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        roleName: 'employee'
      };

      const mockRequestType = {
        id: 1,
        name: 'new_request',
        label: 'New Device Request'
      };

      const mockDeviceType = {
        id: 1,
        name: 'Laptop'
      };

      const mockCreatedRequest = {
        id: 1,
        email: mockRequest.email,
        descriptions: mockRequest.description,
        requestTypeId: mockRequest.requestType,
        deviceTypeId: mockRequest.deviceTypeId,
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser
      };

      const mockTicketTrail = {
        id: 1,
        ticketId: 'TCK123456',
        narration: mockRequest.description,
        externalRequestId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.requestType.findFirst.mockResolvedValue(mockRequestType);
      mockPrisma.deviceType.findFirst.mockResolvedValue(mockDeviceType);
      mockPrisma.device.findFirst.mockResolvedValue(null);
      mockPrisma.externalRequest.findMany.mockResolvedValue([]);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });
      mockPrisma.externalRequest.create.mockResolvedValue(mockCreatedRequest);
      mockPrisma.ticketTrail.create.mockResolvedValue(mockTicketTrail);

      const result = await externalRequestService.submitExternalRequest(
        {},
        mockRequest.email,
        mockRequest.requestType,
        mockRequest.deviceTypeId,
        {},
        mockRequest.description
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe("Your request has been successfully submitted. You will receive an email confirmation shortly.");
      expect(result.data.externalRequest).toEqual(mockCreatedRequest);
      expect(result.data.ticket).toEqual(mockTicketTrail);
      expect(mockPrisma.externalRequest.create).toHaveBeenCalled();
      expect(mockPrisma.ticketTrail.create).toHaveBeenCalled();
    });
  });

  describe('getExternalRequests', () => {
    it('should get external requests with filters', async () => {
      const mockRequests = [
        {
          id: 1,
          email: 'test@example.com',
          requestTypeId: 1,
          descriptions: 'Test request',
          user: {
            id: 1,
            firstName: 'Test',
            lastName: 'User',
            roleName: 'employee'
          },
          device: null,
          requestType: {
            id: 1,
            name: 'new_request',
            label: 'New Device Request'
          },
          ticketTrails: []
        }
      ];

      mockPrisma.$transaction.mockResolvedValue([mockRequests, 1]);

      const [requests, total] = await externalRequestService.getExternalRequests(1, 10, {
        requestTypeId: 1
      });

      expect(requests).toEqual(mockRequests);
      expect(total).toBe(1);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
});
