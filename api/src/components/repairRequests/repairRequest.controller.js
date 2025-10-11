import { ValidationError } from "yup";
import { AppError, asyncHandler } from "../../middleware/errorHandler.js";
import sendResponse from "../../middleware/sendResponse.js";
import { getRepairRequestById, getRepairRequests, createRepairRequestService, updateRepairRequestDeviceStatusService, deleteRepairRequestsById, updateRepairRequestService, getRepairRequestsSummaryService } from "./repairRequest.service.js"
import { listRepairRequestsValidationSchema, getRepairRequestByIdValidationSchema, repairRequestSchema, deleteRepairRequestByIdValidationSchema, updateRepairRequestDeviceStatusPathValidationSchema, updateRepairRequestDeviceStatusBodyValidationSchema, updateRepairRequestSchema } from "./repairRequest.validator.js";

export const listRepairRequests = asyncHandler(async (req, res) => {
    try {
        const validated = await listRepairRequestsValidationSchema.validate(req.query, { stripUnknown: true })
        const {rows, total} = await getRepairRequests(validated)
        return sendResponse(res, 200, 'Repair requests fetched successfully', {
          repairRequests: rows,
          page: Number(validated.page),
          limit: Number(validated.limit),
          total: Number(total),
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            throw new AppError(400, `Validation error: ${error.errors.join(', ')}`);
        }

        throw new AppError(500, 'Failed to fetch repair requests');
    }
})

export const getRepairRequestDetails = asyncHandler(async (req, res) => {
    const validated = await getRepairRequestByIdValidationSchema.validate(req.params, { stripUnknown: true })
    const repairRequest = await getRepairRequestById(validated.id)
    return sendResponse(res, 200, "Repair request fetched successfully", { repairRequest })
})

export const createRepairRequest = asyncHandler( async (req, res) => {
    await repairRequestSchema.validate(req.body, { abortEarly: false });
    const repairRequest = await createRepairRequestService(req, res);
    return sendResponse(res, 201, "Repair request created successfully", repairRequest);
});

export const deleteRepairRequest = asyncHandler(async (req, res) => {
        const validated = await deleteRepairRequestByIdValidationSchema.validate(req.params, { stripUnknown: true })
        const repairRequest = await deleteRepairRequestsById(validated.id,req.user.id)
        return sendResponse(res, 200, "Repair request deleted successfully", { repairRequest })
})

export const updateRepairRequestDeviceStatus = asyncHandler(async (req, res) => {
    const validated =
      await updateRepairRequestDeviceStatusPathValidationSchema.validate(
        req.params,
        { stripUnknown: true },
      );
      
    const body = await updateRepairRequestDeviceStatusBodyValidationSchema.validate(
      req.body,
      { abortEarly: false },
    );

    const result = await updateRepairRequestDeviceStatusService({...validated, status: body.status, userId: req.user.id});
    
    return sendResponse(
      res,
      200,
      'Repair request device status updated successfully',
      result, 
    );
})

export const updateRepairRequest = asyncHandler(async (req, res) => {
    await updateRepairRequestSchema.validate(req.body, { abortEarly: false });
    const repairRequest = await updateRepairRequestService(req, res);
    return sendResponse(res, 200, "Repair request updated successfully", repairRequest);
});

export const getRepairRequestsSummary = asyncHandler(async (req, res) => {
  const summary = await getRepairRequestsSummaryService();
  return sendResponse(res, 200, "Repair requests summary fetched successfully", summary);
});
