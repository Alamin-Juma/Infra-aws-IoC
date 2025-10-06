export const LoginRequestSchema = {
    type: 'object',
    properties: {
        email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'user@griffinglobaltech.com',
        },
        password: {
            type: 'string',
            format: 'password',
            description: 'User password',
            example: 'P@ssw0rd!',
        },
    },
    required: ['email', 'password'],
};

export const LoginResponseSchema = {
    type: 'object',
    properties: {
        token: {
            type: 'string',
            description: 'JWT access token for authentication',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        user: {
            type: 'object',
            properties: {
                id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'user@griffinglobaltech.com' },
                role: { type: 'string', example: 'admin' },
            },
        },
    },
};

export default {
    LoginRequestSchema,
    LoginResponseSchema
};

