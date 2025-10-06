import vendorEvaluationService from './vendorEvaluationService.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';
import sendResponse from '../../middleware/sendResponse.js';

export const getVendorEvaluations = asyncHandler(async (req, res) => {
  const evaluations = await vendorEvaluationService.fetchVendorEvaluations();
  return sendResponse(res, 200, 'Vendor evaluations fetched successfully', evaluations);
});

export const getVendorEvaluationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const evaluation = await vendorEvaluationService.fetchVendorEvaluationById(id);
  
  if (!evaluation) {
    return sendResponse(res, 404, 'Evaluation not found');
  }
  
  return sendResponse(res, 200, 'Vendor evaluation fetched successfully', evaluation);
});

export const createVendorEvaluationHandler = asyncHandler(async (req, res) => {
  const { 
    vendorId, 
    evaluatorId, 
    deliveryTimeliness, 
    productQuality, 
    pricingCompetitiveness, 
    customerService, 
    complianceAndSecurity,
    innovation,
    comments 
  } = req.body;

  if (
    vendorId === undefined ||
    evaluatorId === undefined ||
    deliveryTimeliness === undefined ||
    productQuality === undefined ||
    pricingCompetitiveness === undefined ||
    customerService === undefined
  ) {
    return sendResponse(res, 400, 'All required fields must be provided.');
  }

  const evaluation = await vendorEvaluationService.createVendorEvaluation({
    vendorId,
    evaluatorId,
    deliveryTimeliness,
    productQuality,
    pricingCompetitiveness,
    customerService,
    complianceAndSecurity: complianceAndSecurity || null,
    innovation: innovation || null,
    comments: comments || null,
  });

  return sendResponse(res, 201, 'Vendor evaluation created successfully', evaluation);
});




