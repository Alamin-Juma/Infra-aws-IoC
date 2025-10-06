export const DeviceStatisticsSchema = {
    type: 'object',
    properties: {
      totalDevices: {
        type: 'integer',
        example: 150,
      },
      availableDevices: {
        type: 'integer',
        example: 80,
      },
      assignedDevices: {
        type: 'integer',
        example: 70,
      },
    },
};
  
export const MonthlyRequestCountsSchema = {
    type: 'object',
    properties: {
      months: {
        type: 'array',
        items: {
          type: 'string',
        },
        example: ['January', 'February', 'March'],
      },
      requestCounts: {
        type: 'array',
        items: {
          type: 'integer',
        },
        example: [12, 20, 18],
      },
    },
};
  
export const DeviceSummarySchema = {
    type: 'object',
    properties: {
      conditionStats: {
        type: 'object',
        additionalProperties: {
          type: 'integer',
        },
        example: {
          new: 40,
          damaged: 10,
          lost: 5,
        },
      },
      statusStats: {
        type: 'object',
        additionalProperties: {
          type: 'integer',
        },
        example: {
          assigned: 70,
          available: 80,
        },
      },
    },
};
  
export default {
    DeviceStatisticsSchema,
    MonthlyRequestCountsSchema,
    DeviceSummarySchema,
  };
  