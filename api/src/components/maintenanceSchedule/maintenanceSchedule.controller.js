import { asyncHandler } from '../../middleware/errorHandler.js';
import sendResponse from '../../middleware/sendResponse.js';
import maintenanceScheduleService from './maintenanceSchedule.service.js';

export const getMaintenanceSchedules = asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        search = "",
        status = undefined,
        deviceTypeId = undefined
    } = req.query;

    const [maintenanceSchedules, total] = await maintenanceScheduleService.getMaintenanceSchedules(Number(page), Number(limit), search ? search.trim() : "", status, deviceTypeId);

    return sendResponse(res, 200, 'Maintenance schedules fetched successfully', { maintenanceSchedules, total, page: Number(page), limit: Number(limit) });
});

export const createMaintenanceSchedule = asyncHandler(async (req, res) => {
    const createdMaintenanceSchedule = await maintenanceScheduleService.createMaintenanceSchedule(req);
    return sendResponse(res, 200, 'Maintenance schedule created successfully', { createdMaintenanceSchedule });
});

export const updateMaintenanceSchedule = asyncHandler(async (req, res) => {
    const updatedMaintenanceSchedule = await maintenanceScheduleService.updateMaintenanceSchedule(req.body);
    return sendResponse(res, 200, 'Maintenance schedule updated successfully', { updatedMaintenanceSchedule });
});

export const updateMaintenanceScheduleServiceEntry = asyncHandler(async (req, res) => {
    const updatedMaintenanceScheduleServiceEntry = await maintenanceScheduleService.updateMaintenanceScheduleServiceEntry(req.body);
    return sendResponse(res, 200, 'Service entry updated successfully', { updatedMaintenanceScheduleServiceEntry });
});

export const cancelMaintenanceSchedule = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const canceledMaintenanceSchedule = await maintenanceScheduleService.cancelMaintenanceSchedule(Number(id));
    return sendResponse(res, 200, 'Maintenance schedule cancelled successfully', { canceledMaintenanceSchedule });
});

export const completeMaintenanceSchedule = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const completedMaintenanceSchedule = await maintenanceScheduleService.completeMaintenanceSchedule(Number(id));
    return sendResponse(res, 200, 'Maintenance schedule completed successfully', { completedMaintenanceSchedule });
});

export const deleteMaintenanceSchedule = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deletedMaintenanceSchedule = await maintenanceScheduleService.deleteMaintenanceSchedule(Number(id));
    return sendResponse(res, 200, 'Maintenance schedule deleted successfully', { deletedMaintenanceSchedule });
});