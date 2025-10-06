import sendResponse from '../../middleware/sendResponse.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import procurementRequestService from './procurementRequestService.js';
import config from '../../configs/app.config.js';

export const getAllProcurementRequests = asyncHandler(async (req, res) => {
  const { page = config.PAGE, limit = config.PAGE_LIMIT } = req.query;
  const [requests, total] = await procurementRequestService.getAllProcurementRequests(Number(page), Number(limit));

  return sendResponse(res, 200, 'Procurement requests fetched successfully', { requests, total, page: Number(page), limit: Number(limit) });
});

export const getProcurementRequestById = asyncHandler(async (req, res) => {
  const procurementRequest = await procurementRequestService.getProcurementRequestById(req.params.id);
  return sendResponse(res, 200, 'Procurement request fetched successfully', procurementRequest);
});

export const updateProcurementRequest = asyncHandler(async (req, res) => {
  const procurementRequest = await procurementRequestService.updateProcurementRequest(req.params.id, req.body);
  return sendResponse(res, 200, 'Procurement request updated successfully', procurementRequest);
});

