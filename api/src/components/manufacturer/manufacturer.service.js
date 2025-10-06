import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllManufacturers = (page = 1, limit = 10) => {
    return prisma.$transaction([
        prisma.deviceManufacturer.findMany({
            skip: (page - 1) * limit, // Skip records for pagination
            take: limit, // Limit the number of records
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        }),
        prisma.deviceManufacturer.count(),
    ]);
};

const createManufacturer = (data) => prisma.deviceManufacturer.create({ data });
const deleteManufacturer = (id) => prisma.deviceManufacturer.delete({ where: { id: Number(id) } });
const getManufacturerByName = (name) => prisma.deviceManufacturer.findFirst({
    where: {
        name: {
            equals: name,
            mode: "insensitive"  // Case-insensitive search
        }
    }
});
const updateManufacturer = (id, data) => prisma.deviceManufacturer.update({ where: { id: Number(id) }, data });

export default {
    getAllManufacturers,
    createManufacturer,
    deleteManufacturer,
    getManufacturerByName,
    updateManufacturer
};
