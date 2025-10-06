import { getDeviceHistory } from "./deviceHistoryService.js";

export const fetchDeviceHistory = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    const history = await getDeviceHistory(deviceId, offset, limitNumber); // Pass offset and limit to your data fetching function

    if (!history.length) {
      return res.status(404).json({ message: "No history records found for this device." });
    }

    // Optionally, you can also fetch the total count of records for pagination metadata
    const totalCount = await getTotalDeviceHistoryCount(deviceId); // Implement this function to get the total count

    res.json({
      message: 'History records fetched successfully',
      data: history,
      total: totalCount,
      page: pageNumber,
      limit: limitNumber,
    });
  } catch (error) {
    res.status(500).json({ message: "Unable to retrieve device history. Please try again later." });
  }
};
