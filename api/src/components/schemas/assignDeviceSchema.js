export const AssignDeviceRequestSchema = {
    type: 'object',
    properties: {
      deviceType: {
        type: 'string',
        example: 'laptop',
      },
      assignedBy: {
        type: 'string',
        example: 'admin123',
      },
    },
    required: ['deviceType', 'assignedBy'],
};
  
export const AssignDeviceResponseSchema = {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Device assigned successfully',
      },
    },
};
  
export const UnassignDeviceResponseSchema = {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        example: 'Device unassigned successfully',
      },
    },
};

export default {
    AssignDeviceRequestSchema,
    AssignDeviceResponseSchema,
    UnassignDeviceResponseSchema
}
  