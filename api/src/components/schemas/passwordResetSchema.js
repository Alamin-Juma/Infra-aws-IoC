export const passwordResetSchema = {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: 'Unique identifier for the password reset record',
        example: 1,
      },
      userId: {
        type: 'integer',
        description: 'ID of the user initiating the password reset',
        example: 2,
      },
      token: {
        type: 'string',
        description: 'Password reset token sent to the user',
        example: 'ab4e3c9d6f8b3e7ac8d9',
      },
      status: {
        type: 'boolean',
        description: 'Status of the password reset (whether active or used)',
        example: true,
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the reset request was created',
        example: '2024-04-01T12:00:00Z',
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the reset request was last updated',
        example: '2024-04-01T12:30:00Z',
      },
      expiresAt: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the reset token expires',
        example: '2024-04-01T12:30:00Z',
      },
      used_at: {
        type: 'string',
        format: 'date-time',
        description: 'Timestamp when the token was used (if applicable)',
        nullable: true,
        example: '2024-04-01T12:15:00Z',
      },
      lastUpdatedBy: {
        type: 'integer',
        description: 'ID of the user who last updated this record (nullable)',
        example: 2,
        nullable: true,
      },
    },
  };
  
  export default passwordResetSchema;

