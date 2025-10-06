export const RefreshTokenRequestSchema = {
    type: 'object',
    properties: {
        refreshToken: {
            type: 'string',
            format: 'password',
            description: 'Refresh Token',
            example: 'eyQghefhwbj*******qt4re',
        },
    },
    required: ['refreshToken'],
};

export const RefreshTokenResponseSchema = {
    type: 'object',
    properties: {
        accessToken: {
            type: 'string',
            description: 'JWT access token for authentication',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        refreshToken: {
            type: 'string',
            description: 'JWT refresh token for token refresh',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
    },
};

export default {
    RefreshTokenRequestSchema,
    RefreshTokenResponseSchema
};

