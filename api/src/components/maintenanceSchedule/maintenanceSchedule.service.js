import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler.js';

const prisma = new PrismaClient();

const getMaintenanceSchedules = async (page = 1, limit = 10, search = "", status = undefined, deviceTypeId = undefined) => {
    let whereClause = {
        status: status,
        deviceTypeId,
        deletedAt: null,
        isCancelled: false
    };

    whereClause = search
      ? {...whereClause,
          OR: [
            { status: { contains: status, mode: "insensitive" } },
            { nextDue: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ],
        }
      : whereClause;

    try {
        const [maintenanceSchedules, totalCount] = await Promise.all([
            prisma.maintenanceSchedule.findMany({
                skip: (page - 1) * limit,
                take: limit,
                where: whereClause,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    nextDue: true,
                    endDate: true,
                    status: true,
                    recurring: true,
                    deviceType: {
                        select: {
                            name: true,
                        },
                    },
                    recurrencePattern: {
                        select: {
                            name: true,
                        },
                    },
                    assignment: {
                        select: {
                            assignedToUser: {
                                select: {
                                    firstName: true,
                                    lastName: true
                                }
                            },
                            assignedToRole: {
                                select: {
                                    name: true
                                }
                            },
                        }
                    }
                },
            }),

            prisma.maintenanceSchedule.count({
                where: whereClause,
            }),
        ]);

        return [maintenanceSchedules, totalCount];
    } catch (err) {
        console.error("Failed to fetch maintenance schedules: ", err);
        throw new AppError(500, "Failed to fetch maintenance schedules.");
    }
}

const createMaintenanceSchedule = async (req) => {
    try {
        const payload = req.body;
        let newScheduleData = {
            title: payload.title,
            recurring: payload.recurring,
            nextDue: payload.nextDue,
            endDate: payload.endDate,      
            deviceType: {
                connect:{
                    id: payload.deviceTypeId
                }
            },    
            location: payload.location,  
            recurrencePattern: {
                connect:{
                    id: payload.recurrencePatternId
                }
            },
        };

        let status = 'UPCOMING';

        if(new Date(newScheduleData.nextDue).getDate() === new Date().getDate())
        {
            status = 'IN_PROGRESS';
        }

        newScheduleData = {
            ...newScheduleData,
            status: status
        };

        if(!payload.assignedToRole && !payload.assignedToUser){
            throw new AppError(400, 'A new maintenance schedule must be assigned a reponsible party');
        }

        if(payload.assignedToRole && payload.assignedToUser){
            throw new AppError(400, 'A new maintenance schedule can only be assigned to either an individual or role');
        }

        if(payload.assignedToRole){
            newScheduleData = {
                ...newScheduleData,
                assignment: {
                    create: {
                        assignedToRole: {
                            connect: { id: payload.assignedToRole } 
                        }
                    }
                }
            }
        }

        if(payload.assignedToUser){
            newScheduleData = {
                ...newScheduleData,
                assignment: {
                    create: {
                        assignedToUser: {
                            connect: { id: payload.assignedToUser } 
                        }
                    }
                }
            }
        }

        newScheduleData = {
            ...newScheduleData,
            submitter: { 
                connect: { id: req.user.user.userId }
            },
        }
    
        const newSchedule = await prisma.maintenanceSchedule.create({
          data: {
            ...newScheduleData,
          },
        });

        return newSchedule;
    } catch (error) {
        throw new AppError(500, `Error creating maintenance schedule: ${error.message}`);
    }
}

const updateMaintenanceSchedule = async (req) => {
    
}

const updateMaintenanceScheduleServiceEntry = async (req) => {
    
}

const cancelMaintenanceSchedule = async (maintenanceScheduleId) => {
    try {
        const updatedMaintenanceSchedule = await prisma.maintenanceSchedule.update({
            where: { 
                id: maintenanceScheduleId,
            },
            data: { isCancelled: true },
        });

        return updatedMaintenanceSchedule;
    } catch (error) {
        console.error('Failed to cancel maintenance schedule:', error);
        throw new Error('Failed to cancel maintenance schedule');
    }
}

const completeMaintenanceSchedule = async (maintenanceScheduleId) => {
    try {
        const completedMaintenanceSchedule = await prisma.maintenanceSchedule.update({
            where: { 
                id: maintenanceScheduleId,
                status: {
                    in: ["IN_PROGRESS"]
                }
            },
            data: { status: "COMPLETED" },
        });

        return completedMaintenanceSchedule;
    } catch (error) {
        console.error('Failed to complete maintenance schedule:', error);
        throw new AppError('Failed to complete maintenance schedule');
    }
}

const deleteMaintenanceSchedule = async (maintenanceScheduleId) => {
    try {
        const deletedMaintenanceSchedule = await prisma.maintenanceSchedule.update({
            where: { 
                id: maintenanceScheduleId,
                status: "UPCOMING"
            },
            data: { deletedAt: new Date() },
        });

        return deletedMaintenanceSchedule;
    } catch (error) {
        console.error('Failed to delete maintenance schedule:', error);
        throw new AppError('Failed to delete maintenance schedule');
    }
}

export default {
    getMaintenanceSchedules,
    createMaintenanceSchedule,
    updateMaintenanceSchedule,
    updateMaintenanceScheduleServiceEntry,
    cancelMaintenanceSchedule,
    deleteMaintenanceSchedule,
    completeMaintenanceSchedule
}