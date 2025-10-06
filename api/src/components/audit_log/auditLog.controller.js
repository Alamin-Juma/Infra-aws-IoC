import { asyncHandler } from '../../middleware/errorHandler.js';
import auditLogService from './auditLog.service.js';
import sendResponse from '../../middleware/sendResponse.js';


export const getAuditLogs = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = "" 
  } = req.query;

  const [auditLogs, total] = await auditLogService.getAuditLogs(Number(page), Number(limit), search ? search.trim() : "");

  return sendResponse(res, 200, 'Audit logs fetched successfully', { auditLogs, total, page: Number(page), limit: Number(limit) });
});
