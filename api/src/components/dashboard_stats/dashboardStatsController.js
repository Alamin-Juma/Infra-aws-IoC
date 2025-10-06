import dashboardStatsService from "./dashboardStatsService.js";

export const getDeviceStatistics = async (req, res) => {
    try {
      const statistics = await dashboardStatsService.getDeviceStatistics();
      
      res.status(200).json({
        success: true,
        message: 'Device statistics retrieved successfully',
        data: {
          byType: statistics.deviceTypeCounts,
          byCondition: statistics.conditionCounts,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve device statistics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  export const getMonthlyCounts = async (req, res) => {
    try {
      const monthlyCounts = await dashboardStatsService.getMonthlyRequestCounts();
      res.status(200).json({
        success: true,
        message: 'Monthly request counts retrieved successfully',
        data: monthlyCounts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve monthly request counts',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };


export const getDevicesConditionsAndStatuses = async (req, res) => {
  try {
    const result = await dashboardStatsService.getDevicesConditionAndStatusCounts();
    res.status(200).json({
      success: true,
      message: 'Device types with condition and status counts retrieved successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve device types with condition and status counts',
      error: error.message || 'Unknown error'
    });
  }
};


  export default {getDeviceStatistics,getMonthlyCounts,getDevicesConditionsAndStatuses};
