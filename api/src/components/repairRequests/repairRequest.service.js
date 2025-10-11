import { PrismaClient, RepairDeviceStatus, RepairRequestStatus } from "@prisma/client";
import { AppError } from "../../middleware/errorHandler.js";
import {isValidRepairDeviceStatusTransition}  from "./repairRequest.validator.js";
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

    const [deviceTypeExists, foundCount, matchingDevices, assigneeExists] = await Promise.all([
        prisma.deviceType.findUnique({
            where: { id: Number(deviceType) },
            select: { id: true }
        }),
        prisma.device.count({
            where: { id: { in: affectedDevices } }
        }),
        await prisma.device.findMany({
            where: {
                id: { in: affectedDevices },
                deviceTypeId: Number(deviceType),
            },
            select: { id: true },
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

    if(matchingDevices.length !== affectedDevices.length) {
        throw new AppError('VALIDATION_ERROR', `Some devices do not match the repair request's device type`);
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

export const updateRepairRequestDeviceStatusService = async ({
  id: repairRequestId,
  deviceId,
  status,
  userId,
}) => {



  if (status == RepairDeviceStatus.ASSIGNED_TO_VENDOR) {
    throw new AppError('FORBIDDEN', `${status} is not allowed at the moment`);
  }

  const device = await prisma.repairDevice.findFirst({
    where: { repairRequestId, deviceId, isDeleted: false },
    select: {
      id: true,
      currentStatus: true,
    },
  });

  if (!device) {
    throw new AppError('NOT_FOUND', 'Repair request device was not found');
  }

  const allowed = isValidRepairDeviceStatusTransition(
    device.currentStatus,
    status,
  );

  if (allowed) {
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.repairDevice.update({
        where: { id: device.id },
        data: {
          currentStatus: status,
          repairDeviceHistory: {
            create: {
              deviceStatus: status,
              createdBy: { connect: { id: userId } },
            },
          },
        },
        select: {
          id: true,
          deviceId: true,
          device: { select: { serialNumber: true } },
          createdOn: true,
          createdBy: { select: { id: true, firstName: true, lastName: true } },
          currentStatus: true,
          repairDeviceHistory:
            status == RepairDeviceStatus.ASSIGNED_TO_VENDOR
              ? {
                  select: {
                    vendor: { select: { name: true } },
                    notes: true,
                    deviceStatus: true,
                    createdBy: true,
                    createdOn: true,
                  },
                }
              : {
                  select: {
                    deviceStatus: true,
                    createdBy: {
                      select: { id: true, firstName: true, lastName: true },
                    },
                    createdOn: true,
                  },
                },
        },
      });

      await tx.repairRequest.updateMany({
        where: {
          id: repairRequestId,
          repairDevices: {
            some: {
              isDeleted: false,
              currentStatus: {
                notIn: [RepairDeviceStatus.FIXED, RepairDeviceStatus.RETIRED],
              },
            },
          },
        },
        data: { currentStatus: RepairRequestStatus.IN_PROGRESS },
      });

      await tx.repairRequest.updateMany({
        where: {
          id: repairRequestId,
          repairDevices: {
            none: {
              isDeleted: false,
              currentStatus: {
                notIn: [RepairDeviceStatus.FIXED, RepairDeviceStatus.RETIRED],
              },
            },
          },
        },
        data: { currentStatus: RepairRequestStatus.COMPLETED },
      });

      return updated;
    });

    return result;
  }

  throw new AppError('SERVER_ERROR', 'Repair request device was not updated');
}

export const updateRepairRequestService = async (req) => {
    const id = Number(req.params.id);
    const userId = Number(req.user.id);

    const { description, severity, deviceType, affectedDevices, assignedTo, location } = req.body;

    const updated = await prisma.$transaction(async (tx) => {

        const existing = await tx.repairRequest.findUnique({
            where: { id },
            select: { id: true, repairDevices: true, assignedToId: true, deviceTypeId: true }
        });

    
        if (!existing) {
            throw new AppError('NOT_FOUND', 'Repair request was not found');
        }

        if(existing.assignedToId) {
            throw new AppError('VALIDATION_ERROR', "Can't edit a repair request that's already assigned");
        }

        if (deviceType !== undefined && Number(deviceType) !== existing.deviceTypeId) {
            throw new AppError('VALIDATION_ERROR', 'Changing device type of a repair request is not allowed.');
        }

        const updatedData = {};

        if (description !== undefined && description !== existing.description) {
            const sanitizedDescription = sanitizeHtml(description, { allowedTags: [], allowedAttributes: {} }).trim();
            if (!sanitizedDescription) {
                throw new AppError('VALIDATION_ERROR', "HTML tags and attributes are not allowed in the description.");
            }
            updatedData.description = sanitizedDescription;
        }

        if (severity !== undefined && severity !== existing.severity) {
            updatedData.severity = severity;
        }

        if (deviceType !== undefined && deviceType !== existing.deviceTypeId) {
            updatedData.deviceTypeId = Number(deviceType);
        }

        if (assignedTo !== undefined && assignedTo !== existing.assignedToId) {
            const assigneeExists = prisma.user.findUnique({ where: { id: Number(assignedTo) }, select: { id: true }});

            if (!assigneeExists) {
                throw new AppError('VALIDATION_ERROR', 'Selected user does not exist');
            }

            updatedData.assignedOn = new Date();
            updatedData.assignedById = userId;
            updatedData.assignedToId = Number(assignedTo);
        }

        if (location !== undefined && location !== existing.location) {
            const sanitizedLocation = location ? sanitizeHtml(location, { allowedTags: [], allowedAttributes: {} }) : null;
            updatedData.location = sanitizedLocation;
        }
        
        if (Object.keys(updatedData).length > 0) {
            await tx.repairRequest.update({
                where: { id },
                data: updatedData
            });
        }

        if (affectedDevices !== undefined) {
            const devices = await tx.device.findMany({
                where: { id: { in: affectedDevices } },
                select: { id: true, deviceTypeId: true }
            });

            const mismatched = devices.filter(d => d.deviceTypeId !== existing.deviceTypeId);
            if (mismatched.length > 0) {
                throw new AppError(
                    'VALIDATION_ERROR',
                    `Some devices do not match the repair request's device type`
                );
            }

            const newDeviceIds = affectedDevices;

            const existingRepairDevices = await tx.repairDevice.findMany({
                where: { repairRequestId: existing.id }
            });

            const existingDeviceIds = existingRepairDevices.filter(d => !d.isDeleted).map(d => d.deviceId);

            const toAdd = newDeviceIds.filter(id => !existingDeviceIds.includes(id));
            const toRemove = existingDeviceIds.filter(id => !newDeviceIds.includes(id));

            const toReactivate = toAdd.filter(deviceId =>
                existingRepairDevices.some(d => d.deviceId === deviceId && d.isDeleted)
            );

            const toTrulyAdd = toAdd.filter(deviceId =>
                !existingRepairDevices.some(d => d.deviceId === deviceId)
            );

            // Reactivate soft deleted devices
            if (toReactivate.length > 0) {
                await tx.repairDevice.updateMany({
                    where: {
                        repairRequestId: existing.id,
                        deviceId: { in: toReactivate },
                        isDeleted: true
                    },
                    data: {
                        isDeleted: false,
                        deletedById: null,
                        deletedOn: null,
                        currentStatus: RepairDeviceStatus.PENDING
                    }
                });

                // Create history records for reactivated devices
                await tx.repairDeviceHistory.createMany({
                    data: toReactivate.map(deviceId => ({
                        repairDeviceId: existingRepairDevices.find(d => d.deviceId === deviceId)?.id,
                        deviceStatus: RepairDeviceStatus.PENDING,
                        createdById: userId,
                        notes: 'Device reactivated in repair request'
                    }))
                });
            }
            
            // Add truly new devices
            if (toTrulyAdd.length > 0) {
                const created = await Promise.all(
                    toTrulyAdd.map(deviceId =>
                        tx.repairDevice.create({
                            data: {
                                repairRequestId: existing.id,
                                deviceId,
                                isDeleted: false,
                                currentStatus: RepairDeviceStatus.PENDING,
                                createdOn: new Date(),
                                createdById: userId
                            }
                        })
                    )
                );

                await tx.repairDeviceHistory.createMany({
                    data: created.map(device => ({
                        repairDeviceId: Number(device.id),
                        deviceStatus: RepairDeviceStatus.PENDING,
                        createdById: Number(req.user.id),
                        notes: 'Device added to repair request'
                    }))
                });
            }

            // Soft delete devices no longer in the list
            if (toRemove.length > 0) {
                await tx.repairDevice.updateMany({
                    where: {
                        repairRequestId: existing.id,
                        deviceId: { in: toRemove },
                        isDeleted: false
                    },
                    data: {
                        isDeleted: true,
                        deletedById: userId,
                        deletedOn: new Date()
                    }
                });

                await tx.repairDeviceHistory.createMany({
                    data: toRemove.map(deviceId => ({
                        repairDeviceId: existingRepairDevices.find(d => d.deviceId === deviceId)?.id,
                        deviceStatus: RepairDeviceStatus.PENDING,
                        createdById: userId,
                        notes: 'Device removed from repair request'
                    }))
                });
            }
        }

        return await tx.repairRequest.findUnique({
            where: { id },
            include: { repairDevices: true }
        });
    });

    return updated;
};

export const getRepairRequestsSummaryService = async () => {
    
  const allRecords = await prisma.repairRequest.count({
    where: {
      isDeleted: false,
    },
  });

  const result = await prisma.repairRequest.groupBy({
    where: {
      isDeleted: false,
    },
    by: ['currentStatus'],
    _count: true,
  });

  await prisma.$disconnect();

  if (!result) {
    throw new AppError('SERVER_ERROR', 'Failed to get repair requests summary');
  }

  const requiredStatuses = ['IN_PROGRESS', 'COMPLETED', 'SUBMITTED'];
  const statusArray = result;

  const statusMap = statusArray.reduce((acc, item) => {
    acc[item.currentStatus] = item._count;
    return acc;
  }, {});

  const allStatuses = requiredStatuses.reduce((acc, status) => {
    acc[status] = statusMap[status] ?? 0;
    return acc;
  }, {});

  allStatuses['TOTAL'] = allRecords;

  return allStatuses;
};
