import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const attachAuditLogger = (externalPrismaClient, user) => {
    if(!user) return externalPrismaClient;

    externalPrismaClient.$use(async (params, next) => {
        const mutationTypes = ['create', 'update', 'delete', 'createMany', 'deleteMany'];
        const isMutation = mutationTypes.includes(params.action);

        if (!isMutation) {
            return next(params);
        }

        const model = params.model;

        if (model == "AuditLog") return await next(params);

        const action = params.action.toUpperCase();
        const userId = user.id;
        let meta = null;
        let oldRecord = null;

        if (params.action === 'update' || params.action === 'delete') {
            oldRecord = await externalPrismaClient[model.toLowerCase()].findUnique({
                where: params.args.where,
            });
        }

        if (params.action === 'deleteMany') {
            meta = { deleted: params.where }
        }

        if (params.action === 'createMany') {
            meta = { created: params.args.data }
        }

        const result = await next(params);

        let newRecord = null;

        if (params.action === 'create' || params.action === 'update') {
            newRecord = result;
        }

        const auditableId = result?.id || oldRecord?.id ;

        if(params.action === 'create' || params.action === 'update' || params.action === 'delete') {
             if (auditableId && model) {
                await externalPrismaClient.auditLog.create({
                    data: {
                            eventCategory: 'DATA_CHANGE',
                            action,
                            auditableId: auditableId.toString(),
                            auditableType: model,
                            userId: userId ?? null,
                            oldValues: oldRecord ? cleanForAudit(oldRecord) : null,
                            newValues: newRecord ? cleanForAudit(newRecord) : null,
                            meta,
                    },
                });
            }
        }

        if(params.action === 'createMany' || params.action === 'deleteMany') {
            await externalPrismaClient.auditLog.create({
                data: {
                        eventCategory: 'DATA_CHANGE',
                        action,
                        auditableType: model,
                        userId: userId ?? null,
                        oldValues: oldRecord ? cleanForAudit(oldRecord) : null,
                        newValues: newRecord ? cleanForAudit(newRecord) : null,
                        meta,
                },
            });
        }

        return result;
    });

    return externalPrismaClient;
}

const cleanForAudit = (obj) => {
  const clone = { ...obj };
  delete clone.password;
  delete clone.createdAt;
  delete clone.updatedAt;
  return clone;
}

const getAuditLogs = async (page = 1, limit = 10, search = "") => {
    const whereClause = search
      ? {
          OR: [
            { action: { contains: search, mode: "insensitive" } },
            { eventCategory: { contains: search, mode: "insensitive" } },
            { auditableType: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [logs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: whereClause,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          action: true,
          eventCategory: true,
          auditableType: true,
          createdAt: true,
          updatedAt: true,
          oldValues: true,
          newValues: true,
          meta: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),

      prisma.auditLog.count({
        where: whereClause,
      }),
    ]);

    return [logs, totalCount];
};

export default {
    getAuditLogs, 
    attachAuditLogger
};

