import { ProcurementRequestStatus } from '@prisma/client';

import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import {
  createProcurementRequestItem,
  getProcurementRequestsItems,
  createProcurementRequests,
  getProcurementRequestsItemByID,
  updateProcurementRequestItemByID,
  deleteProcurementRequestItemByID,
  getProcurementRequests,
  updateProcurementRequestByID,
  updateProcurementRequestID,
  getProcurementRequestByID,
} from './procurementRequests.services.js';
import sendResponse from '../../middleware/sendResponse.js';
import config from '../../configs/app.config.js';

export const ApproveRejectProcurementRequest = asyncHandler(
  async (req, res, next) => {
    const { id, action } = req.params;
    const { comment, reason } = req.body;   

    const currentRequest = await getProcurementRequestsItemByID({ 
      id: Number(id),
      include: {
        CreatedBy: true
      }
    });
    if (!currentRequest) {
      return next(
        new AppError(
          'NOT_FOUND',
          `Procurement request with ID ${id} not found`,
        ),
      );
    }
    if (action === ProcurementRequestStatus.Rejected && !reason)  {
      return next(
        new AppError(
          'VALIDATION_ERROR',
          `Reason is required for ${action} status`,
        ),
      );
    }
    
    if ( (action === ProcurementRequestStatus.Pending  && !comment)) {
      return next(
        new AppError(
          'VALIDATION_ERROR',
          `Comment is required for ${action} status`,
        ),
      );
    }

    const baseUrl = req.get('host')?.includes('localhost') ? config.FRONTEND_URL : config.FRONTEND_URL_PROD;

    const procurementRequest = await updateProcurementRequestByID({
      id,
      action,
      comment: reason || comment,
      req,
      baseUrl
    });

    if (!procurementRequest) {
      return next(
        new AppError(
          'NOT_FOUND',
          `Procurement request with ID ${id} not found`,
        ),
      );
    }

    return sendResponse(
      res,
      200,
      'Procurement request updated successfully',
      procurementRequest,
    );
  },
);

export const getAllProcurementRequests = asyncHandler(async (req, res) => {
  const { page = config.PAGE, limit = config.PAGE_LIMIT, ...query } = req.query;
  const procurementRequests = await getProcurementRequests({
    page: Number(page),
    limit: Number(limit),
    ...query,
  });
  return sendResponse(
    res,
    200,
    'Procurement requests fetched successfully',
    procurementRequests,
  );
});

export const createProcurementRequest = asyncHandler(async (req, res, next) => {
  const baseUrl = req.get('host')?.includes('localhost') ? config.FRONTEND_URL : config.FRONTEND_URL_PROD;
  
  const procurementRequest = await createProcurementRequests(req.body, req, baseUrl);
  
  return sendResponse(
    res,
    201,
    'Procurement request created successfully',
    procurementRequest,
  );
});

export const createProcurementRequestItems = asyncHandler(async (req, res) => {
  const procurementRequests = await createProcurementRequestItem(req.body);
  return sendResponse(
    res,
    200,
    'Procurement requests created successfully',
    procurementRequests,
  );
});

export const getAllProcurementRequestItems = asyncHandler(async (req, res) => {
  const { page = config.PAGE, limit = config.PAGE_LIMIT, ...query } = req.query;
  const procurementRequests = await getProcurementRequestsItems({
    page: Number(page),
    limit: Number(limit),
    ...query,
  });
  return sendResponse(
    res,
    200,
    'Procurement requests fetched successfully',
    procurementRequests,
  );
});

export const getProcurementRequestItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const procurementRequest = await getProcurementRequestsItemByID({
    id: Number(id),
  });
  return sendResponse(
    res,
    200,
    'Procurement request fetched successfully',
    procurementRequest,
  );
});

export const updateProcurementRequestItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const procurementRequest = await updateProcurementRequestItemByID({
    id: Number(id),
    ...req.body,
  });
  return sendResponse(
    res,
    200,
    'Procurement request updated successfully',
    procurementRequest,
  );
});

export const deleteProcurementRequestItem = asyncHandler(
  async (req, res, next) => {
    const procurementRequest = await deleteProcurementRequestItemByID(
      req,
      res,
      next,
    );
    return sendResponse(
      res,
      200,
      'Procurement request deleted successfully',
      procurementRequest,
    );
  },
);

export const updateProcurementRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const procurementRequest = await updateProcurementRequestID({
    id: Number(id),
    ...req.body,
  });
  return sendResponse(
    res,
    200,
    'Procurement request updated successfully',
    procurementRequest,
  );
});

export const getProcurementRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const procurementRequest = await getProcurementRequestByID({
    id: Number(id),
  });
  return sendResponse(
    res,
    200,
    'Procurement request fetched successfully',
    procurementRequest,
  );
});
