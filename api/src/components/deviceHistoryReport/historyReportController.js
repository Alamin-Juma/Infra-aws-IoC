import historyReportService from './historyReportService.js';
import { handleResponse, handleError } from './responceHelper.js';

const getDeviceHistory = async (req, res) => {
  try {
    const { from, to, serialNumber, deviceTypeId } = req.query;
    const data = await historyReportService.getDeviceHistory({ from, to, serialNumber, deviceTypeId });
    
    if (data.length === 0) {
      return handleResponse({ res, status: 404, message: 'No history found for the given date range.' });
    }
    
    handleResponse({ res, data });
  } catch (error) {
    handleError({ res, error, message: 'Failed to fetch device history' });
  }
};

const exportDeviceHistory = async (req, res) => {
  try {
    const { from, to, serialNumber, deviceTypeId, format } = req.query;
    const data = await historyReportService.exportDeviceHistory({ from, to, serialNumber, deviceTypeId, format });
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=device-history.csv');
      return res.send(data);
    } else if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=device-history.pdf');
      return res.send(data);
    }
    
    handleResponse({ res, data });
  } catch (error) {
    handleError({ res, error, message: 'Failed to export device history' });
  }
};

export default {
  getDeviceHistory,
  exportDeviceHistory
};

