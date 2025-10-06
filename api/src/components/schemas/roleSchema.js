export const roleSchema = {
    Role: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: 'Unique identifier for the role',
          example: 1,
        },
        name: {
          type: 'string',
          description: 'Name of the role',
          example: 'Admin',
        },
        status: {
          type: 'boolean',
          description: 'Role status (active/inactive)',
          example: true,
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Role creation timestamp',
          example: '2024-04-01T12:00:00Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp for the role',
          example: '2024-04-01T12:30:00Z',
        },
        lastUpdatedBy: {
          type: 'integer',
          description: 'ID of the user who last updated this role',
          example: 2,
          nullable: true,
        },
      },
    },
  };
  
  export default roleSchema;

