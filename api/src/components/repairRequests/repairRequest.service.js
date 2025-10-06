import { PrismaClient, RepairDeviceStatus, RepairRequestStatus } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler.js";
import sanitizeHtml from 'sanitize-html';

const prisma = new PrismaClient();


export const getRepairRequests = async ({
    page = 1,
    limit = 10,
    status = null,
    dateFrom = null,
    dateTo = null,
    assignedTo = null,
}) => {
    let defaultFilters = {
        isDeleted: false,
    }

    if (assignedTo) {
        defaultFilters = { ...defaultFilters, assignedToId: assignedTo }
    }
    if (status) {
        defaultFilters = { ...defaultFilters, currentStatus: status }
    }

    if (dateFrom && dateTo) {
        const start = new Date(dateFrom);
        const end = new Date(dateTo);

        /**
         * Since JS will default the end date to 00:00
         * We will force the end date to be the end of the day
         */
        end.setHours(23, 59, 59, 999);

        defaultFilters = {
            ...defaultFilters,
            createdAt: {
                gte: start,
                lte: end,
            },
        }
    }

    try {
        const [rows, total] = await prisma.$transaction([
            prisma.repairRequest.findMany({
                skip: (page - 1) * limit,
                take: limit,
                where: defaultFilters,
                orderBy: { createdAt: 'desc' },
                select: {
                id: true,
                currentStatus: true,
                severity: true,
                location: true,
                createdAt: true,
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                assignedBy: { select: { id: true, firstName: true, lastName: true } },
                assignedOn: true,
                assignedTo: { select: { id: true, firstName: true, lastName: true } },
                deviceType: { select: { id: true, name: true } },
                _count: true,
                },
            }),
            prisma.repairRequest.count({ where: defaultFilters }),
        ]);

        return { rows, total };
    } catch (error) {
        const msg = "Failed to fetch repair request records";
        console.error(`${msg}, `, error)
        throw new AppError(500, msg)
    }

}

export const getRepairRequestById = async (id) => {
    const result = await prisma.repairRequest.findUnique({
        where: {
            id,
            isDeleted: false,
        },
        select: {
            id: true,
            currentStatus: true,
            description: true,
            severity: true,
            location: true,
            createdAt: true,
            createdBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                }
            },
            assignedBy: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                }
            },
            assignedOn: true,
            assignedTo: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                }
            },
            deviceType: {
                select: {
                    id: true,
                    name: true,
                }
            },
            repairDevices: {
                where: {
                    isDeleted: false,
                },
                orderBy: {
                    device: {
                        serialNumber: 'asc',
                    }
                },
                select: {
                    id: true,
                    deviceId: true,
                    device: {
                        select: {
                            serialNumber: true,
                        }
                    },
                    createdOn: true,
                    createdBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                    currentStatus: true,
                    repairDeviceHistory: {
                        where: {
                            deviceStatus: RepairDeviceStatus.ASSIGNED_TO_VENDOR,
                        },
                        select: {
                            vendor: {
                                select: {
                                    name: true,
                                }
                            },
                            notes: true,
                        },
                    },
                }
            },
            _count: {
                select: {
                    repairDevices: {
                        where: {
                            isDeleted: false,
                        }
                    }
                }
            }
        },
    })

    if (!result) {
        throw new AppError('NOT_FOUND', "Repair request not found");
    }

    return result;
}

export const createRepairRequestService = async (req) => {
    const { description, assignedTo, location, severity, deviceType, affectedDevices } = req.body;

    const sanitizedDescription = sanitizeHtml(description, { allowedTags: [], allowedAttributes: {} });
    const sanitizedLocation = location ? sanitizeHtml(location, { allowedTags: [], allowedAttributes: {} }) : null;

    if (!sanitizedDescription.trim()) {
        throw new AppError('VALIDATION_ERROR', "HTML tags and attributes are not allowed in the description.");
    }

    if (!affectedDevices || !Array.isArray(affectedDevices) || affectedDevices.length === 0) {
        throw new AppError('VALIDATION_ERROR', `Please add at least one affected device.`);
    }

    const [deviceTypeExists, foundCount, assigneeExists] = await Promise.all([
        prisma.deviceType.findUnique({
            where: { id: Number(deviceType) },
            select: { id: true }
        }),
        prisma.device.count({
            where: { id: { in: affectedDevices } }
        }),
        assignedTo ? prisma.user.findUnique({
            where: { id: Number(assignedTo) }
        }) : Promise.resolve(null)
    ]);

    if (!deviceTypeExists) {
        throw new AppError('VALIDATION_ERROR', 'Device type does not exist');
    }

    if (foundCount !== affectedDevices.length) {
        throw new AppError('VALIDATION_ERROR', `Invalid device IDs.`);
    }

    const assignedRequest = {};

    if (assignedTo) {
        if (!assigneeExists) {
            throw new AppError('VALIDATION_ERROR', 'Invalid assignedTo user ID');
        }

        assignedRequest.assignedOn = new Date();
        assignedRequest.assignedById = req.user.id;
        assignedRequest.assignedToId = Number(assignedTo);
    }

    const repairRequest = await prisma.repairRequest.create({
        data: {
            deviceTypeId: deviceType,
            severity,
            location: sanitizedLocation || null,
            description: sanitizedDescription,
            currentStatus: RepairRequestStatus.SUBMITTED,
            createdById: req.user.id,
            isDeleted: false,
            ...assignedRequest,
            repairDevices: {
                create: affectedDevices.map((id) => ({
                    device: {
                        connect: { id }
                    },
                    isDeleted: false,
                    createdBy: {
                        connect: {
                            id: req.user.id,
                        }
                    },
                    repairDeviceHistory: {
                        create: {
                            createdBy: {
                                connect: {
                                    id: req.user.id,
                                }
                            },
                            deviceStatus: RepairDeviceStatus.PENDING
                        }
                    }
                }))
            }
        },

        select: {
            id: true,
            description: true,
            severity: true,
            location: true,
            createdAt: true,
            currentStatus: true,
            assignedToId: true,
            assignedOn: true,
            assignedById: true,
            createdBy: {
                select: {
                    id: true,
                    email: true,
                    roleName: true,
                    firstName: true,
                    lastName: true,
                }

            },
            repairDevices: {
                select: {
                    device: true,
                }
            }
        }
    });

    return repairRequest;
};

export const deleteRepairRequestsById = async (repairRequestId, deletedById) => {
    const result = await prisma.repairRequest.findUnique(
       {
        where:{
            id: Number(repairRequestId),
        }
       }
    );
    
    if (!result) {
        throw new AppError("NOT_FOUND", "Repair request not found");
    }

    // soft delete the records within a transaction
    const [updatedRepairRequest] = await prisma.$transaction([
      
        //repair request
      prisma.repairRequest.update({
        where: { id: repairRequestId },
        data: {
          isDeleted: true,
          deletedOn: new Date(),
          deletedById: deletedById,
        },
      }),

      // related repair devices
      prisma.repairDevice.updateMany({
        where: {
          repairRequestId: repairRequestId,
          isDeleted: false, // Only update devices that aren't already marked as deleted
        },
        data: {
          isDeleted: true,
          deletedOn: new Date(),
          deletedById: deletedById,
        },
      }),
    ]);

    await prisma.$disconnect();

     if (!updatedRepairRequest) {
        throw new AppError("SERVER_ERROR", "Failed to delete repair request");
    }

    return updatedRepairRequest;
};

