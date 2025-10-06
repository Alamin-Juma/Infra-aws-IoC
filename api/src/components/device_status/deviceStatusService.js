import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllDeviceStatuses = async () => {
    return await prisma.deviceStatus.findMany();
};

export const getDeviceStatusById = async (id) => {
    return await prisma.deviceStatus.findUnique({ where: { id: Number(id) } });
};

export const createDeviceStatus = async (data) => {
    return await prisma.deviceStatus.create({ data });
};

export const updateDeviceStatus = async (id, data) => {
    return await prisma.deviceStatus.update({ where: { id: Number(id) }, data });
};

export const deleteDeviceStatus = async (id) => {
    await prisma.deviceStatus.delete({ where: { id: Number(id) } });
};
