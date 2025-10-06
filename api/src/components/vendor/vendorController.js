import vendorService from './vendorService.js';
import sendResponse from '../../middleware/sendResponse.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import config from '../../configs/app.config.js';  


export const getAllVendors = asyncHandler(async (req, res) => {
  const { page = config.PAGE, limit = config.PAGE_LIMIT, search = "" } = req.query;

  
  const [vendors, total] = await vendorService.getAllVendors(Number(page), Number(limit), search.trim());

  
  return sendResponse(res, 200, 'Vendors fetched successfully', {
    vendors,
    total,
    page: Number(page),
    limit: Number(limit),
  });
});


export const getVendorById = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getVendorById(req.params.id);

  
  return sendResponse(res, 200, 'Vendor fetched successfully', vendor);
});


