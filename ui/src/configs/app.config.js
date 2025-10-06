const currentDomain = window.location.hostname;

const config = {
    acceptable_domains: [
        'griffinglobaltech.com',
        'thh-llc.com',
        'thejitu.com',
        'loca.lt'
    ],
    API_BASE_URL: currentDomain.includes('localhost') ? 'http://localhost:9000' : 'https://rsfeb25-api.gsgus.com',
    FRONTEND_URL_PROD: 'https://rsfeb25.gsgus.com',
    ACCESS_TOKEN_NAME: 'access_token',
    REFRESH_TOKEN_NAME: 'refresh_token',
    USER_ROLE: 'user_role',   
    AUTHORITIES: 'permissions',
    INACTIVITY_WARNING_TIME: 2*60,
    INACTIVITY_TIME:10*50,
    NOTIFICATION_TYPES: {
        TICKET: 'ticket',
        TICKET_ASSIGNED: 'ticket_assigned',
        TICKET_STATUS: 'ticket_status',
        TICKET_COMPLETED: 'ticket_completed',
        TICKET_REASSIGNED: 'ticket_reassigned',
        QUOTATION_SUBMITTED: 'quotation_submitted'
    },
    NOTIFICATION_ACTIONS: {
        ASSIGNED: 'assigned',
        STATUS_UPDATE: 'status_update',
        COMPLETED: 'completed',
        REASSIGNED: 'reassigned'
    },
    ROUTES: {
        EXTERNAL_REQUESTS: '/app/external-requests',
        REQUEST_DETAILS: '/app/external-requests/request-details',
        PROCUREMENT_QUOTATIONS: '/app/procurement/quotations'
    },
    TICKET_STATUS: {
        PENDING: { key: 'PENDING', name: 'Pending' },
        ASSIGNED: { key: 'ASSIGNED', name: 'Assigned' },
        IN_PROGRESS: { key: 'IN_PROGRESS', name: 'In Progress' },
        COMPLETED: { key: 'COMPLETED', name: 'Completed' }
    },
    DEVICE_CONDITIONS: {
        GOOD: 'Good',
        DAMAGED: 'Damaged',
        DECOMMISSIONED: 'Decommissioned'
    },
    ROLES: {
        EMPLOYEE: 'employee'
    },
    STORAGE_KEYS: {
        NOTIFICATIONS: 'app_notifications'
    },
    ONBOARDING_DEVICES: [
        { id: 1, name: 'laptop', label: 'Laptop' },
        { id: 2, name: 'monitor', label: 'Monitor' },
        { id: 3, name: 'mouse', label: 'Mouse' },
        { id: 4, name: 'headset', label: 'Headset' }
    ]
};
  
export default config;
