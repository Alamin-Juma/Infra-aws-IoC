export const repairRequest = {
    type: 'object',
    properties: {
        id: {
            type: 'integer',
            description: 'Unique identifier for the repair request',
            example: 1,
        },
        currentStatus: {
            type: 'string',
            description: 'Current status of the repair request',
            example: 'SUBMITTED',
        },
        severity: {
            type: 'string',
            description: 'Severity of the issue',
            example: 'High',
        },
        location: {
            type: 'string',
            description: 'Location of the repair (if any)',
            nullable: true,
            example: null,
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Repair request creation timestamp',
            example: '2025-09-25T09:14:15.159Z',
        },
        createdBy: { $ref: '#/components/schemas/User' },
        assignedBy: { $ref: '#/components/schemas/User', nullable: true },
        assignedOn: {
            type: 'string',
            format: 'date-time',
            description: 'When the repair request was assigned',
            nullable: true,
            example: '2025-09-25T09:14:15.159Z',
        },
        assignedTo: { $ref: '#/components/schemas/User' },
        deviceType: { $ref: '#/components/schemas/DeviceType' },
        _count: {
            type: 'object',
            description: 'Counts of related entities',
            properties: {
                repairDevices: {
                    type: 'integer',
                    description: 'Number of related repair devices',
                    example: 0,
                },
            },
        },
    },
}

export default repairRequest;
