import { asyncHandler } from '../../middleware/errorHandler.js';  
import { fetchVendorDevices } from './vendorDeviceService.js'; 
import sendResponse from '../../middleware/sendResponse.js';  


export const getVendorDevices = asyncHandler(async (req, res) => { 
  const devices = await fetchVendorDevices();  
  return sendResponse(res, 200, 'Vendor devices fetched successfully', devices);
});





