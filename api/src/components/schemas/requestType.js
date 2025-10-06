export const requestType = {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: 'Unique identifier for the request type',
        example: 1,
      },
      name: {
        type: 'string',
        description: 'The name of the request type',
        example: 'Service Request',
      },
      label: {
        type: 'string',
        description: 'Optional label for the request type',
        example: 'Urgent Service',
        nullable: true,
      },
      status: {
        type: 'boolean',
        description: 'Status of the request type (active/inactive)',
        example: true,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the request type was created',
        example: '2024-04-01T12:00:00Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the request type was last updated',
        example: '2024-04-01T12:30:00Z',
      },
      lastUpdatedBy: {
        type: 'integer',
        description: 'ID of the user who last updated this record',
        example: 2,
        nullable: true,
      },
    },
  };
  
  export default requestType;

