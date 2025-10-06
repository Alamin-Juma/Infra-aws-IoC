import externalRequestService from './externalRequest.service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import sendResponse from '../../middleware/sendResponse.js';

export const submitExternalRequest = asyncHandler(async (req, res) => {
  const { email, requestType, deviceTypeId, description, deviceTypes } = req.body;
  if (!email || !requestType || !description) {
    return sendResponse(res, 400, 'Missing required fields');
  }

  const requestTypeNum = Number(requestType);
  if (requestTypeNum === 3 || requestTypeNum === 4) {
    if (!deviceTypeId) {
      return sendResponse(res, 400, 'Device type is required for lost/broken device reports');
    }
  }

  const result = await externalRequestService.submitExternalRequest(
    req,
    email,
    requestType,
    deviceTypeId,
    deviceTypes,
    description
  );

  return sendResponse(res, 201, 'External request submitted successfully', result);
});

export const fetchTickets = asyncHandler(async (req, res) => {
  const { status, userId, deviceId } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;

  const filters = {};

  if (status) {
    filters.externalRequest = { status: status === 'true' };
  }
  if (userId) {
    filters.externalRequest = { ...filters.externalRequest, userId: parseInt(userId) };
  }
  if (deviceId) {
    filters.externalRequest = { ...filters.externalRequest, deviceId: parseInt(deviceId) };
  }

  const result = await externalRequestService.fetchTickets(filters, page, limit);
  return sendResponse(res, 200, 'Tickets fetched successfully', result);
});

export const getExternalRequests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, requestType, ticket_no, requestStatus = "PENDING", approved } = req.query;
  
  const filters = {};
  if (requestType) {
    filters.requestTypeId = Number(requestType);
  }
  if (!approved && requestStatus) {
    filters.requestStatus = requestStatus;
  }
  if (ticket_no) {
    filters.ticket_no = ticket_no;
  }
  if(approved && approved == 'true'){
    filters.excludeStatuses = ['PENDING', 'REJECTED'];
  }
  if(approved && approved == 'false'){
    filters.includeStatuses = ['PENDING', 'REJECTED'];
  }

  const [requests, total] = await externalRequestService.getExternalRequests(Number(page), Number(limit), filters);

  return sendResponse(res, 200, 'External requests fetched successfully', {
    requests,
    total,
    page: Number(page),
    limit: Number(limit)
  });
});

export const getLostAndBrokenDeviceRequests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, requestType, from, to, manufacturer } = req.query;

  const filters = {};
  if (requestType) {
    filters.requestTypeId = Number(requestType);
  }
  if (from) {
    filters.from = new Date(from);
  }
  if (to) {
    filters.to = new Date(to).setHours(23, 59, 59, 999);
  }
  if (manufacturer) {
    filters.manufacturerId = Number(manufacturer);
  }

  const [requests, total] = await externalRequestService.getLostAndBrokenDevicesRequests(Number(page), Number(limit), filters);

  return sendResponse(res, 200, 'Lost & broken devices fetched successfully', {
    requests,
    total,
    page: Number(page),
    limit: Number(limit)
  });
});

export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await externalRequestService.getTicketById(req.params.id);
  return sendResponse(res, 200, 'Ticket fetched successfully', ticket);
});

export const updateTicket = asyncHandler(async (req, res) => {
  const updatedTicket = await externalRequestService.updateTicket(req, req.params.id, req.body);
  return sendResponse(res, 200, 'Ticket updated successfully', updatedTicket);
});

export const updateTicketStatus = asyncHandler(async (req, res) => {
  let { action, reason } = req.body;
  const id = req.params.id;
  const validDecisionActions = ['APPROVED', 'REJECTED'];
  
  action = action?.trim().toUpperCase();
  reason = reason?.trim();

  if(!action || !validDecisionActions.includes(action)) return sendResponse(res, 400, 'A valid decision action is required');
  if(action === 'REJECTED' && !reason) return sendResponse(res, 400, 'Rejection reason is required.');
  if(action === 'APPROVED' && (reason && reason.length > 0 )) return sendResponse(res, 400, 'Rejection reason is not required when approving a request.');

  const udpateTicketStatus = await externalRequestService.updateTicketStatus(req, id, action, reason);
  
  return sendResponse(res, 200, 'Ticket status updated successfully', udpateTicketStatus);
});
