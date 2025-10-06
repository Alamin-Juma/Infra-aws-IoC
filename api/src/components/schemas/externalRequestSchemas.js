export const ExternalRequestSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer', example: 1 },
        deviceId: { type: 'integer', example: 101 },
        userId: { type: 'integer', nullable: true, example: 5 },
        requestTypeId: { type: 'integer', example: 3 },
        deviceTypeId: { type: 'integer', example: 2 },
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        descriptions: { type: 'string', nullable: true, example: 'The device is not working properly' },
        status: { type: 'boolean', example: true },
        requestStatus: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            example: 'PENDING',
        },
        assignedUser: { type: 'integer', nullable: true, example: 12 },
        createdAt: { type: 'string', format: 'date-time', example: '2024-07-15T12:34:56Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-07-16T09:21:30Z' },
        lastUpdatedBy: { type: 'integer', nullable: true, example: 6 },
    },
};

export const ExternalRequestCreateSchema = {
    type: 'object',
    properties: {
        deviceId: { type: 'integer', example: 101 },
        userId: { type: 'integer', nullable: true, example: 5 },
        requestTypeId: { type: 'integer', example: 3 },
        deviceTypeId: { type: 'integer', example: 2 },
        email: { type: 'string', format: 'email', example: 'user@example.com' },
        descriptions: { type: 'string', nullable: true, example: 'The device is not working properly' },
    },
    required: ['deviceId', 'requestTypeId', 'deviceTypeId', 'email'],
};

export default {
    ExternalRequestSchema,
    ExternalRequestCreateSchema
};

