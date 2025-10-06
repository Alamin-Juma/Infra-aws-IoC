export const manufacturerSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
      description: 'Unique identifier for the manufacturer',
      example: 1,
    },
    name: {
      type: 'string',
      description: 'Name of the manufacturer',
      example: 'Apple',
    },
    status: {
      type: 'boolean',
      description: 'Status of the manufacturer (whether active or not)',
      example: true,
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp when the manufacturer was created',
      example: '2024-04-01T12:00:00Z',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp when the manufacturer was last updated',
      example: '2024-04-01T12:30:00Z',
    },
  },
};

export const manufacturerCreateSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Name of the manufacturer to be created',
      example: 'Apple',
    },
    status: {
      type: 'boolean',
      description: 'Status of the manufacturer to be created',
      example: true,
    },
  },
  required: ['name'],
};

export const manufacturerUpdateSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Name of the manufacturer to update',
      example: 'Apple',
    },
    status: {
      type: 'boolean',
      description: 'Status of the manufacturer to update',
      example: true,
    },
  },
};

