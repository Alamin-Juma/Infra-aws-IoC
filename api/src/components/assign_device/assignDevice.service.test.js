import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import assignDeviceService from './assignDevice.service.js'; 

// Mock Prisma Client
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
    },
    device: {
      update: vi.fn(),
    },
    deviceActivity: {
      create: vi.fn(),
    },
  };
  return {
    PrismaClient: vi.fn(() => mockPrisma),
    default: { PrismaClient: vi.fn(() => mockPrisma) }, 
  };
});

// Mock Nodemailer
vi.mock('nodemailer', async (importOriginal) => {
  const actual = await importOriginal(); 
  return {
    ...actual,
    default: {
      createTransport: vi.fn(() => ({
        sendMail: vi.fn(),
      })),
    },
  };
});

const prismaMock = new PrismaClient();
const transporterMock = nodemailer.createTransport();

describe('assignDevice', () => {
    beforeEach(() => {
      vi.clearAllMocks(); // Reset mocks before each test
    });
  
      it('should throw an error if user is not found', async () => {
      const mockData = {
        userEmail: 'nonexistent@example.com',
        description: 'Device assignment',
      };
  
      // Mock Prisma to return null (user not found)
      prismaMock.user.findUnique.mockResolvedValue(null);
  
      // Call the function and expect an error
      await expect(assignDeviceService.assignDevice(1, mockData)).rejects.toThrow(
        'User not found'
      );
    });
  
  
  });

