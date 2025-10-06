import { asyncHandler } from '../../middleware/errorHandler.js';  // Import asyncHandler
import auditTrailService from './auditTrailService.js';
import sendResponse from '../../middleware/sendResponse.js';

export const createAuditTrail = asyncHandler(async (req, res) => {
  const { activity, performedBy, note } = req.body;

  const auditTrail = await auditTrailService.createAuditTrail(activity, performedBy, note);
  return sendResponse(res, 201, 'Audit trail created successfully', auditTrail);
});

export const getAuditTrails = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  
  const [auditTrails, total] = await auditTrailService.getAuditTrails(Number(page), Number(limit), search.trim());

  return sendResponse(res, 200, 'Audit trails fetched successfully', { auditTrails, total, page: Number(page), limit: Number(limit) });
});
