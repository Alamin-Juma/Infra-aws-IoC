export const DeviceTypeSchema = {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: 'Unique identifier for the device type',
        example: 1,
      },
      name: {
        type: 'string',
        description: 'Device type name',
        example: 'Smartphone',
      },
      specifications: {
        type: 'string',
        nullable: true,
        description: 'Technical specifications of the device type',
        example: '8GB RAM, 128GB Storage',
      },
      status: {
        type: 'boolean',
        description: 'Indicates if the device type is active',
        example: true,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the device type was created',
        example: '2024-04-01T12:00:00Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the device type was last updated',
        example: '2024-04-01T12:30:00Z',
      },
      lastUpdatedBy: {
        type: 'integer',
        nullable: true,
        description: 'ID of the user who last updated this device type',
        example: 5,
      },
    },
    required: ['name'],
  };
  
  export default DeviceTypeSchema;

