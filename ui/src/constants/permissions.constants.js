// Super Admin Permission
export const PERMISSION_ALL = 'all_permissions';

// Request Type Management
export const PERMISSION_CREATE_REQUEST_TYPE = 'create_request_type';
export const PERMISSION_VIEW_REQUEST_TYPE = 'view_request_types';
export const PERMISSION_MANAGE_REQUEST_TYPE = 'manage_request_type';
export const PERMISSION_DELETE_REQUEST_TYPE = 'delete_request_type';

// Request Management
export const PERMISSION_SUBMIT_REQUEST = 'submit_request';
export const PERMISSION_ASSIGN_REQUESTER = 'assign_requester';
export const PERMISSION_REVIEW_REQUEST = 'review_request';
export const PERMISSION_CLOSE_REQUEST = 'close_request';


// Device Availability & Inventory
export const PERMISSION_CHECK_DEVICE_AVAILABILITY = 'check_device_availability';
export const PERMISSION_UPDATE_INVENTORY = 'update_inventory';
export const PERMISSION_VIEW_INVENTORY_REPORTS = 'view_inventory_reports';


// Procurement Workflow
export const PERMISSION_SUBMIT_PROCUREMENT_REQUEST = 'submit_procurement_request';
export const PERMISSION_APPROVE_PROCUREMENT_REQUEST = 'approve_procurement_request';
export const PERMISSION_MANAGE_PROCUREMENT_REQUEST = 'manage_procurement_request';
export const PERMISSION_DELETE_PROCUREMENT_REQUEST = 'delete_procurement_request';
export const PERMISSION_VIEW_PROCUREMENT_REQUESTS = 'view_procurement_requests';


// Quotation Management
export const PERMISSION_CREATE_QUOTATION = 'create_quotation';
export const PERMISSION_APPROVE_QUOTATION = 'approve_quotation';
export const PERMISSION_MANAGE_QUOTATION = 'manage_quotation';
export const PERMISSION_VIEW_QUOTATIONS = 'view_quotations';


// Purchase Orders & Vendor Interaction
export const PERMISSION_GENERATE_PO = 'generate_po';
export const PERMISSION_EMAIL_VENDOR = 'email_vendor';
export const PERMISSION_REVIEW_PO = 'review_po';
export const PERMISSION_CREATE_PURCHASE_ORDER = 'create_purchase_order';
export const PERMISSION_VIEW_PURCHASE_ORDERS = 'view_purchase_orders';


// Goods Handling & Inspection
export const PERMISSION_RECEIVE_GOODS = 'receive_goods';
export const PERMISSION_GOODS_INSPECTION = 'goods_inspection';
export const PERMISSION_RECEIVE_EMAIL_ACKNOWLEDGMENT = 'receive_email_acknowledgment';


// Vendor Management
export const PERMISSION_CREATE_VENDOR = 'create_vendor';
export const PERMISSION_VIEW_VENDORS = 'view_vendors';
export const PERMISSION_MANAGE_VENDOR = 'manage_vendor';
export const PERMISSION_DELETE_VENDOR = 'delete_vendor';


// Vendor Evaluation & Contracts
export const PERMISSION_EVALUATE_VENDOR = 'evaluate_vendor';
export const PERMISSION_VIEW_VENDOR_EVALUATIONS = 'view_vendor_evaluations';
export const PERMISSION_SUBMIT_VENDOR_EVALUATION = 'submit_vendor_evaluation';
export const PERMISSION_MANAGE_VENDOR_CONTRACTS = 'manage_vendor_contracts';
export const PERMISSION_VIEW_VENDOR_CONTRACTS = 'view_vendor_contracts';
export const PERMISSION_VIEW_VENDOR_DEVICES = 'view_vendor_devices';


// User Management
export const PERMISSION_MANAGE_USERS = 'manage_users';
export const PERMISSION_VIEW_USERS = 'view_users';
export const PERMISSION_CREATE_USER = 'create_user';
export const PERMISSION_MANAGE_SINGLE_USER = 'manage_single_user';


// Role Management
export const PERMISSION_VIEW_ROLES = 'view_roles';
export const PERMISSION_CREATE_ROLE = 'create_role';
export const PERMISSION_MANAGE_ROLE = 'manage_role';
export const PERMISSION_TOGGLE_ROLE_STATUS = 'toggle_role_status';


// Authentication & Security
export const PERMISSION_AUTHENTICATION_LOGIN = 'authentication_login';
export const PERMISSION_LOCKOUT_AFTER_FAILED_ATTEMPTS = 'lockout_after_failed_attempts';
export const PERMISSION_RESET_PASSWORD = 'reset_password';


// Manufacturer Management
export const PERMISSION_VIEW_MANUFACTURERS = 'view_manufacturers';
export const PERMISSION_CREATE_MANUFACTURER = 'create_manufacturer';
export const PERMISSION_MANAGE_MANUFACTURER = 'manage_manufacturer';
export const PERMISSION_DELETE_MANUFACTURER = 'delete_manufacturer';

// Preventive Mainstance
export const PERMISSION_VIEW_PREVENTIVE_MAINTENANCE = 'view_preventive_maintenance';
export const PERMISSION_MANAGE_MAINTENANCE = 'manage_maintenance';
export const PERMISSION_VIEW_SCHEDULE = 'view_maintenance_schedule';
export const PERMISSION_VIEW_MAINTENANCE_HISTORY = 'view_maintenance_history';
export const PERMISSION_MANAGE_REPAIR_REQUESTS = 'manage_repair_requests';
export const PERMISSION_VIEW_REPAIR_REQUESTS = 'view_repair_requests';
export const PERMISSION_MANAGE_INVENTORY_AUDIT = 'manage_inventory_audit';
export const PERMISSION_CREATE_PATTERN = 'create_pattern';
export const PERMISSION_EDIT_PATTERN = 'edit_pattern';
export const PERMISSION_DELETE_PATTERN = 'delete_pattern';
export const PERMISSION_CREATE_REPAIR_REQUEST = 'create_repair_request';

// Manufacturer Inventory
export const PERMISSION_VIEW_MANUFACTURER_INVENTORY = 'view_manufacturer_inventory';
export const PERMISSION_CREATE_MANUFACTURER_INVENTORY = 'create_manufacturer_inventory';
export const PERMISSION_MANAGE_MANUFACTURER_INVENTORY = 'manage_manufacturer_inventory';
export const PERMISSION_DELETE_MANUFACTURER_INVENTORY = 'delete_manufacturer_inventory';


// Device Type Management
export const PERMISSION_VIEW_DEVICE_TYPES = 'view_device_types';
export const PERMISSION_CREATE_DEVICE_TYPE = 'create_device_type';
export const PERMISSION_MANAGE_DEVICE_TYPE = 'manage_device_type';
export const PERMISSION_DELETE_DEVICE_TYPE = 'delete_device_type';


// External Requests
export const PERMISSION_VIEW_EXTERNAL_REQUESTS = 'view_external_requests';
export const PERMISSION_CREATE_EXTERNAL_REQUEST = 'create_external_request';
export const PERMISSION_MANAGE_EXTERNAL_REQUEST = 'manage_external_request';


// Device Management
export const PERMISSION_MANAGE_DEVICES = 'manage_devices';

// Device Spec Management
export const PERMISSION_VIEW_DEVICE_SPECS = 'view_device_specs';
export const PERMISSION_CREATE_DEVICE_SPEC = 'create_device_spec';

// Device Status Management
export const PERMISSION_VIEW_DEVICE_STATUS = 'view_device_status';
export const PERMISSION_UPDATE_DEVICE_STATUS = 'update_device_status';

// Device Condition Management
export const PERMISSION_VIEW_DEVICE_CONDITION = 'view_device_condition';
export const PERMISSION_UPDATE_DEVICE_CONDITION = 'update_device_condition';

// Device Activity Management
export const PERMISSION_VIEW_DEVICE_ACTIVITY = 'view_device_activity';


// System Monitoring & Reporting
export const PERMISSION_IMPORT_DATA = 'import_data';
export const PERMISSION_VIEW_SYSTEM_HEALTH = 'view_system_health';
export const PERMISSION_VIEW_DASHBOARD_ANALYTICS = 'view_dashboard_analytics';
export const PERMISSION_VIEW_REPORTS = 'view_reports';
export const PERMISSION_VIEW_AUDIT_TRAIL = 'view_audit_trail';


export const PERMISSION_GROUP_PROCUREMENT_MANAGEMENT = [
    PERMISSION_VIEW_PROCUREMENT_REQUESTS,
    PERMISSION_SUBMIT_PROCUREMENT_REQUEST,
    PERMISSION_VIEW_QUOTATIONS,
    PERMISSION_MANAGE_VENDOR_CONTRACTS,
    PERMISSION_VIEW_VENDOR_EVALUATIONS
];

export const PERMISSION_GROUP_FINANCE_MANAGEMENT = [
    PERMISSION_VIEW_PURCHASE_ORDERS,
    PERMISSION_VIEW_QUOTATIONS
];

export const PERMISSION_GROUP_USER_MANAGEMENT = [
    PERMISSION_MANAGE_USERS,
    PERMISSION_VIEW_ROLES
];

export const PERMISSION_GROUP_INVENTORY_MANAGEMENT = [
    PERMISSION_MANAGE_DEVICES,
    PERMISSION_VIEW_DEVICE_SPECS,
    PERMISSION_VIEW_MANUFACTURERS,
    PERMISSION_VIEW_DEVICE_TYPES,
    PERMISSION_VIEW_REPAIR_REQUESTS,
];