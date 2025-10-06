import quotationService from './quotationService.js';
import sendResponse from '../../middleware/sendResponse.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import config from '../../configs/app.config.js';

export const getAllQuotations = asyncHandler(async (req, res) => {
  const { page = config.PAGE, limit = config.PAGE_LIMIT, quotationId = "" } = req.query;


  const result = await quotationService.getAllQuotations(
    Number(page),
    Number(limit),
    quotationId.trim()
  );

  return sendResponse(res, 200, 'Quotations fetched successfully', result);
});

export const createQuotation = asyncHandler(async (req, res) => {
  const quotation = await quotationService.createQuotation(req);
  return sendResponse(res, 201, 'Quotation created successfully', quotation);
});

export const getQuotationById = asyncHandler(async (req, res) => {
  const quotation = await quotationService.getQuotationById(req.params.id);
  return sendResponse(res, 200, 'Quotation fetched successfully', quotation);
});

export const updateQuotation = asyncHandler(async (req, res) => {
  const quotation = await quotationService.updateQuotation(req.params.id, req.body);
  return sendResponse(res, 200, 'Quotation updated successfully', quotation);
});


