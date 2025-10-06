import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDeviceHistory = async (deviceId) => {
  return await prisma.deviceActivity.findMany({
    where: { deviceId: Number(deviceId) },
    include: {
      user: { select: { firstName: true, lastName: true } },
      activityType: { select: { name: true } },
      device: { select: { deviceStatus: { select: { name: true } } } }
    },
    orderBy: { createdAt: "desc" }
  });
};
