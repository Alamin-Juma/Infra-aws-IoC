import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllActivityTypes, getActivityTypeById, createActivityType, updateActivityType, deleteActivityType } from './deviceActivityService.js';
import { PrismaClient } from '@prisma/client';

vi.mock('@prisma/client', () => {
  const mockPrisma = {
    activityType: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(async (queries) => Promise.all(queries.map(q => q()))),
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

const prisma = new PrismaClient();

describe('ActivityType Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error for invalid page or limit', async () => {
    await expect(getAllActivityTypes(0, 5)).rejects.toThrow('Page and limit must be positive integers.');
  });

  it('should fetch an activity type by ID', async () => {
    prisma.activityType.findUnique.mockResolvedValue({ id: 1, name: 'Test Activity' });
    const result = await getActivityTypeById(1);
    expect(result).toEqual({ id: 1, name: 'Test Activity' });
  });

  it('should throw an error when activity type is not found', async () => {
    prisma.activityType.findUnique.mockResolvedValue(null);
    await expect(getActivityTypeById(99)).rejects.toThrow('ActivityType not found');
  });

  it('should create a new activity type', async () => {
    prisma.activityType.create.mockResolvedValue({ id: 1, name: 'New Activity', status: true, lastUpdatedBy: 'Admin' });
    const result = await createActivityType({ name: 'New Activity', lastUpdatedBy: 'Admin' });
    expect(result.name).toBe('New Activity');
  });

  it('should update an existing activity type', async () => {
    prisma.activityType.update.mockResolvedValue({ id: 1, name: 'Updated Activity', status: false, lastUpdatedBy: 'Admin' });
    const result = await updateActivityType(1, { name: 'Updated Activity', status: false, lastUpdatedBy: 'Admin' });
    expect(result.name).toBe('Updated Activity');
  });

  it('should delete an activity type', async () => {
    prisma.activityType.delete.mockResolvedValue({});
    await expect(deleteActivityType(1)).resolves.toBeUndefined();
  });
});
