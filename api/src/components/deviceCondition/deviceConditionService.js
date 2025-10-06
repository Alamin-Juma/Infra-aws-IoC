import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export const getAllDeviceConditions = async () => {
    return await prisma.deviceCondition.findMany();
};

export const getDeviceConditionById = async (id) => {
    return await prisma.deviceCondition.findUnique({ where: { id: Number(id) } });
};

export const createDeviceCondition = async (data) => {
    return await prisma.deviceCondition.create({ data });
};

export const updateDeviceCondition = async (id, data) => {
    return await prisma.deviceCondition.update({ where: { id: Number(id) }, data });
};

export const deleteDeviceCondition = async (id) => {
    await prisma.deviceCondition.delete({ where: { id: Number(id) } });
};

export default {
    getAllDeviceConditions,
    getDeviceConditionById,
    createDeviceCondition,
    updateDeviceCondition,
    deleteDeviceCondition
}

