import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createAuditTrail = async (activity, performedBy, note) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: performedBy } });
      if (!user) {
        throw new Error(`User with ID ${performedBy} does not exist`);
      }
  
      return await prisma.auditTrail.create({
        data: {
          activity,
          performedBy,
          note,
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error("Failed to create audit trail: " + error.message);
    }
  };
  


  const getAuditTrails = async (page = 1, limit = 10, search = "") => {
    const whereClause = search
      ? {
          OR: [
            { activity: { contains: search, mode: "insensitive" } },
            { note: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};
  
    return prisma.$transaction([
      prisma.auditTrail.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          activity: true,
          note: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
  
      prisma.auditTrail.count({
        where: whereClause,
      }),
    ]);
  };


  export default {
    createAuditTrail,
    getAuditTrails,
  };
  
  

