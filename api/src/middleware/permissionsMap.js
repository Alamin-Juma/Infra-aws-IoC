export default {
  '/users': {
    GET: ['VIEW_USERS'],
    POST: ['CREATE_USER'],
  },
  '/users/:id': {
    GET: ['MANAGE_SINGLE_USER'],
    PUT: ['MANAGE_SINGLE_USER'],
    DELETE: ['MANAGE_SINGLE_USER'],
  },
  '/users/active/all': {
    GET: ['VIEW_USERS'],
  },
  '/users/status/make-an-admin': {
    PUT: ['MANAGE_USERS'],
  },
  '/users/employee/getByEmail': {
    GET: ['VIEW_USERS'],
  },
  '/users/api/filter': {
    GET: ['VIEW_USERS'],
  },
  '/users/:id/toggle-status': {
    PATCH: ['MANAGE_USERS'],
  },
  '/roles/create': {
    POST: ['CREATE_ROLE']
  },
  '/roles': {
    GET: ['VIEW_ROLES'],
    POST: ['CREATE_ROLE'],
  },
  '/roles/create': {
    POST: ['CREATE_ROLE'],
  },
  '/roles/:id': {
    GET: ['MANAGE_ROLE'],
    PUT: ['MANAGE_ROLE'],
    DELETE: ['MANAGE_ROLE'],
  },
  '/roles/:id/toggle-status': {
    PATCH: ['MANAGE_ROLE'],
  },

  '/assign/:id': {
    POST: ['ASSIGN_REQUESTER'],
  },
  '/unassign/:id': {
    POST: ['UNASSIGN_DEVICE'],
  },

  '/external-requests': {
    GET: ['VIEW_EXTERNAL_REQUEST'],
    POST: ['CREATE_EXTERNAL_REQUEST'],
  },
  '/external-requests/findAll': {
    GET: ['VIEW_EXTERNAL_REQUEST'],
  },
  '/external-requests/lost-broken-requests': {
    GET: ['VIEW_EXTERNAL_REQUEST'],
  },
  '/external-requests/:id': {
    GET: ['MANAGE_EXTERNAL_REQUEST'],
    PUT: ['MANAGE_EXTERNAL_REQUEST'],
  },
  '/request-types': {
    GET: ['VIEW_REQUEST_TYPES'],
    POST: ['CREATE_REQUEST_TYPE'],
  },
  '/request-types/:id': {
    GET: ['MANAGE_REQUEST_TYPE'],
    PUT: ['MANAGE_REQUEST_TYPE'],
    DELETE: ['DELETE_REQUEST_TYPE'],
  },
  '/deviceTypes': {
    POST: ['CREATE_DEVICE_TYPE']
  },
  '/deviceTypes/:id': {
    GET: ['VIEW_DEVICE_TYPE'],
    PUT: ['MANAGE_DEVICE_TYPE'],
    DELETE: ['DELETE_DEVICE_TYPE'],
  },

  '/api/uploadCSV': {
    POST: ['IMPORT_DATA'],
  },
  '/doc': {
    POST: ['IMPORT_DATA'],
  },
  '/forgot-password': {
    POST: ['RESET_PASSWORD'],
  },
  '/auth': {
    POST: ['AUTHENTICATION_LOGIN'],
  },
  '/api/specifications': {
    GET: ['VIEW_DEVICE_SPECS'],
    POST: ['CREATE_DEVICE_SPEC'],
  },
  '/manufacturer': {
    GET: ['VIEW_MANUFACTURERS'],
    POST: ['CREATE_MANUFACTURER'],
  },
  '/history': {
    GET: ['VIEW_HISTORY'],
  },
  '/api/devices': {
    GET: ['VIEW_DEVICES'],
    POST: ['MANAGE_DEVICE'],
  },
  '/api/device-condition': {
    GET: ['VIEW_DEVICE_CONDITION'],
    POST: ['UPDATE_DEVICE_CONDITION'],
  },
  '/api/device-status': {
    GET: ['VIEW_DEVICE_STATUS'],
    POST: ['UPDATE_DEVICE_STATUS'],
  },
  '/assignDevice': {
    POST: ['ASSIGN_REQUESTER'],
  },
  '/email': {
    POST: ['EMAIL_VENDOR'],
  },
  '/externalRequest': {
    GET: ['VIEW_EXTERNAL_REQUESTS']
  },
  '/externalRequest/statusDecision/:id': {
    POST: ['APPROVE_EXTERNAL_REQUEST']
  },
  '/deviceActivity': {
    GET: ['VIEW_DEVICE_ACTIVITY'],
  },
  '/api/reports': {
    GET: ['VIEW_INVENTORY_REPORTS'],
  },
  '/api/device-activities': {
    GET: ['VIEW_ASSIGNMENT_REPORT'],
  },
  '/api/procurements-requests': {
    GET: ['VIEW_PROCUREMENT_REQUESTS'],
    POST: ['SUBMIT_PROCUREMENT_REQUEST'],
  },
  '/api/vendors': {
    GET: ['VIEW_VENDORS'],
    POST: ['MANAGE_VENDOR'],
  },
  '/api/vendorDevices': {
    GET: ['VIEW_VENDOR_DEVICES'],
  },
  '/api/audit-trail': {
    POST: ['VIEW_AUDIT_TRAIL'],
    GET: ['VIEW_AUDIT_TRAIL'],
  },
  '/api/audit-log': {
    GET: ['VIEW_AUDIT_TRAIL'],
  },
  '/api/vendorEvaluation': {
    POST: ['EVALUATE_VENDOR'],
    GET: ['VIEW_VENDOR_EVALUATIONS'],
  },
  '/api/quotation': {
    POST: ['MANAGE_QUOTATION'],
    GET: ['VIEW_QUOTATIONS'],
  },
  '/api/quotations': {
    POST: ['CREATE_QUOTATION'],
    GET: ['VIEW_QUOTATIONS'],
  },
  '/api/purchase-orders': {
    GET: ['VIEW_PURCHASE_ORDERS'],
    POST: ['CREATE_PURCHASE_ORDER'],
    PUT: ['REVIEW_PO'],
  },
  '/api/vendor-contracts': {
    GET: ['VIEW_VENDOR_CONTRACTS'],
    POST: ['MANAGE_VENDOR_CONTRACT'],
  },
  '/api/analytics': {
    GET: ['VIEW_ANALYTICS_DASHBOARD'],
  },
  '/api/maintenance-schedules': {
    GET: ['VIEW_MAINTENANCE_SCHEDULE'],
    POST: ['CREATE_MAINTENANCE_SCHEDULE'],
  },
  '/api/maintenance-schedules/:id': {
    DELETE: ['DELETE_MAINTENANCE_SCHEDULE'],
  },
  '/api/maintenance-schedules/:id/cancel': {
    PATCH: ['MANAGE_MAINTENANCE_SCHEDULE']
  },
  '/api/maintenance-schedules/:id/complete': {
    PATCH: ['MANAGE_MAINTENANCE_SCHEDULE'],
  },
  '/api/repair-requests': {
    GET: ['VIEW_REPAIR_REQUESTS'],
    POST: ['CREATE_REPAIR_REQUEST'],
  },
  '/api/repair-requests/:id': {
    GET: ['VIEW_REPAIR_REQUESTS'],
    DELETE: ['DELETE_REPAIR_REQUEST'],
  }
};
