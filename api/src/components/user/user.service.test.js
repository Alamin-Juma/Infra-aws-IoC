import { describe, test, expect, vi, beforeEach, afterEach, it } from 'vitest';
import userService from './user.service';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
vi.mock('@prisma/client', () => {
    const prismaMock = {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findMany: vi.fn(),
            count: vi.fn(),
        },
        $transaction: vi.fn(async (queries) => Promise.all(queries.map((q) => q()))),
    };

    return { PrismaClient: vi.fn(() => prismaMock) };
});

const prisma = new PrismaClient();

describe('User Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });


    it('should get a user by ID', async () => {
        const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' };
        prisma.user.findUnique.mockResolvedValue(mockUser);

        const result = await userService.getUserById(1);

        expect(result).toEqual(mockUser);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
        });
    });

    it('should update a user', async () => {
        const updatedUser = { id: 1, email: 'updated@example.com', name: 'Updated User' };
        prisma.user.update.mockResolvedValue(updatedUser);
        prisma.user.findUnique.mockResolvedValue(updatedUser);

        const result = await userService.updateUser(1, { email: 'updated@example.com' });

        expect(result).toEqual(updatedUser);
        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { email: 'updated@example.com' },
        });
    });

    it('should delete a user', async () => {
        prisma.user.delete.mockResolvedValue({ id: 1, email: 'test@example.com' });

        const result = await userService.deleteUser(1);

        expect(result).toEqual({ id: 1, email: 'test@example.com' });
        expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw an error when deleting a non-existent user', async () => {
        prisma.user.findUnique.mockResolvedValue(null); // Ensure user does not exist

        await expect(userService.deleteUser(999)).rejects.toThrow('User not found.');

        expect(prisma.user.delete).not.toHaveBeenCalled(); // Ensure delete is NOT called
    });
});
