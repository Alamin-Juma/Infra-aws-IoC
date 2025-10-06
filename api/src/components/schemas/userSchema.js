export const userSchema = {
    User: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: 'Unique identifier for the user',
          example: 1,
        },
        firstName: {
          type: 'string',
          description: "User's first name",
          example: 'John',
        },
        lastName: {
          type: 'string',
          description: "User's last name",
          example: 'Doe',
        },
        email: {
          type: 'string',
          description: "User's email address",
          example: 'john.doe@example.com',
        },
        password: {
          type: 'string',
          description: "User's password (hashed)",
          example: 'hashed_password',
          nullable: true,
        },
        status: {
          type: 'boolean',
          description: 'User account status (active/inactive)',
          example: true,
        },
        roleName: {
          type: 'string',
          description: "Role of the user",
          example: 'employee',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'User creation timestamp',
          example: '2024-04-01T12:00:00Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp for the user',
          example: '2024-04-01T12:30:00Z',
        },
        lastUpdatedBy: {
          type: 'integer',
          description: 'ID of the user who last updated this record',
          example: 2,
          nullable: true,
        },
      },
    },
  };

  export default userSchema;

