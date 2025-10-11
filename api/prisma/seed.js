import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { permissionsSeed } from './permissionsSeed.js';
import { connect } from 'puppeteer-core';

const prisma = new PrismaClient();

const testUsers = [
  {
    email: 'admin@itrack.com',
    firstName: 'Admin',
    lastName: 'User',
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
    status: true,
    role: {
      connect: { name: 'admin' },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    email: 'employee@griffinglobaltech.com',
    firstName: 'Employee',
    lastName: 'User',
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
    status: true,
    role: {
      connect: { name: 'employee' },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    email: 'it@griffinglobaltech.com',
    firstName: 'IT',
    lastName: 'User',
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
    status: true,
    role: {
      connect: { name: 'it_staff' },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    email: 'finance@griffinglobaltech.com',
    firstName: 'Finance',
    lastName: 'User',
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
    status: true,
    role: {
      connect: { name: 'finance' },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    email: 'procurement@griffinglobaltech.com',
    firstName: 'Procurement',
    lastName: 'User',
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
    status: true,
    role: {
      connect: { name: 'procurement' },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function main() {
  await prisma.role.createMany({
    data: [
      { name: 'admin', status: true },
      { name: 'employee', status: true },
      { name: 'user', status: true },
      { name: 'it_staff', status: true },
      { name: 'procurement', status: true },
      { name: 'finance', status: true },
    ],
    skipDuplicates: true,
  });
  await prisma.permission.createMany({
    data: [
      { name: 'submit_request', routeName: 'Submit Request' },
      { name: 'assign_requester', routeName: 'Assign Requester' },
      { name: 'review_request', routeName: 'Review Request' },
      { name: 'close_request', routeName: 'Close Request' },
      {
        name: 'check_device_availability',
        routeName: 'Check Device Availability',
      },
      {
        name: 'submit_procurement_request',
        routeName: 'Submit Procurement Request',
      },
      {
        name: 'approve_procurement_request',
        routeName: 'Approve Procurement Request',
      },
      { name: 'create_quotation', routeName: 'Create Quotation' },
      {
        name: 'approve_quotation',
        routeName: 'Approve Quotation',
      },
      { name: 'generate_po', routeName: 'Generate PO' },
      { name: 'email_vendor', routeName: 'Email Vendor' },
      { name: 'receive_goods', routeName: 'Receive Goods' },
      { name: 'goods_inspection', routeName: 'Goods Inspection' },
      { name: 'review_po', routeName: 'Review PO' },
      { name: 'evaluate_vendor', routeName: 'Evaluate Vendor' },
      { name: 'update_inventory', routeName: 'Update Inventory' },
      {
        name: 'receive_email_acknowledgment',
        routeName: 'Receive Email Acknowledgment',
      },
      { name: 'manage_users', routeName: 'Manage Users' },
      {
        name: 'view_inventory_reports',
        routeName: 'View Inventory Reports',
      },
      {
        name: 'authentication_login',
        routeName: 'Authentication Login',
      },
      {
        name: 'lockout_after_failed_attempts',
        routeName: 'Lockout After Failed Attempts',
      },
      { name: 'view_users', routeName: 'View Users' },
      { name: 'create_user', routeName: 'Create User' },
      { name: 'manage_single_user', routeName: 'Manage Single User' },
      { name: 'view_roles', routeName: 'View Roles' },
      { name: 'create_role', routeName: 'Create Role' },
      { name: 'manage_role', routeName: 'Manage Role' },
      { name: 'toggle_role_status', routeName: 'Toggle Role Status' },
      { name: 'reset_password', routeName: 'Reset Password' },
      { name: 'view_manufacturers', routeName: 'View Manufacturers' },
      { name: 'create_manufacturer', routeName: 'Create Manufacturer' },
      { name: 'manage_manufacturer', routeName: 'Manage Manufacturer' },
      { name: 'delete_manufacturer', routeName: 'Delete Manufacturer' },
      { name: 'view_device_types', routeName: 'View Device Types' },
      { name: 'create_device_type', routeName: 'Create Device Type' },
      { name: 'manage_device_type', routeName: 'Manage Device Type' },
      { name: 'delete_device_type', routeName: 'Delete Device Type' },
      { name: 'view_external_requests', routeName: 'View External Requests' },
      { name: 'create_external_request', routeName: 'Create External Request' },
      { name: 'manage_external_request', routeName: 'Manage External Request' },
      { name: 'import_data', routeName: 'Upload CSV / Import Data' },
      { name: 'view_system_health', routeName: 'System Health Check' },
      {
        name: 'view_dashboard_analytics',
        routeName: 'View Dashboard Analytics',
      },
      { name: 'view_device_activity', routeName: 'View Device Activity' },
      { name: 'view_reports', routeName: 'View Reports' },
      { name: 'manage_devices', routeName: 'Manage Devices' },
      { name: 'view_device_specs', routeName: 'View Device Specs' },
      { name: 'create_device_spec', routeName: 'Create Device Spec' },
      { name: 'update_device_status', routeName: 'Update Device Status' },
      { name: 'update_device_condition', routeName: 'Update Device Condition' },
      {
        name: 'submit_vendor_evaluation',
        routeName: 'Submit Vendor Evaluation',
      },
      { name: 'view_vendor_evaluations', routeName: 'View Vendor Evaluations' },
      { name: 'view_vendors', routeName: 'View Vendors' },
      { name: 'create_vendor', routeName: 'Create Vendor' },
      { name: 'manage_vendor', routeName: 'Manage Vendor' },
      { name: 'delete_vendor', routeName: 'Delete Vendor' },
      { name: 'manage_vendor_contracts', routeName: 'Manage Vendor Contracts' },
      { name: 'view_vendor_contracts', routeName: 'View Vendor Contracts' },
      { name: 'create_purchase_order', routeName: 'Create Purchase Order' },
      { name: 'view_purchase_orders', routeName: 'View Purchase Orders' },
      { name: 'manage_quotation', routeName: 'Manage Quotation' },
      { name: 'view_quotations', routeName: 'View Quotations' },
      {
        name: 'view_procurement_requests',
        routeName: 'View Procurement Requests',
      },
      { name: 'view_audit_trail', routeName: 'View Audit Trail' },
      { name: 'view_vendor_devices', routeName: 'View Vendor Devices' },
      { name: 'view_request_types', routeName: 'View Request Types' },
      { name: 'create_request_type', routeName: 'Create Request Type' },
      { name: 'manage_request_type', routeName: 'Manage Request Type' },
      { name: 'delete_request_type', routeName: 'Delete Request Type' },
      {
        name: 'approve_external_request',
        routeName: 'Approve External Request',
      },
      { name: 'view_request_types', routeName: 'View Request Types' },
      { name: 'create_request_type', routeName: 'Create Request Type' },
      { name: 'manage_request_type', routeName: 'Manage Request Type' },
      { name: 'delete_request_type', routeName: 'Delete Request Type' },
      {
        name: 'approve_external_request',
        routeName: 'Approve External Request',
      },
      {
        name: 'view_preventive_maintenance',
        routeName: 'View Preventive Maintenance',
      },
      { name: 'manage_maintenance', routeName: 'Manage Maintenance' },
      {
        name: 'view_maintenance_schedule',
        routeName: 'View Maintenance Schedule',
      },
      {
        name: 'manage_maintenance_schedule',
        routeName: 'Manage Maintenance Schedule',
      },
      {
        name: 'delete_maintenance_schedule',
        routeName: 'Delete Maintenance Schedule',
      },
      {
        name: 'create_maintenance_schedule',
        routeName: 'Create Maintenance Schedule',
      },
      {
        name: 'view_maintenance_history',
        routeName: 'View Maintenance History',
      },
      { name: 'manage_repair_requests', routeName: 'Manage Repair Requests' },
      { name: 'manage_inventory_audit', routeName: 'Manage Inventory Audit' },

      { name: 'create_pattern', routeName: 'Create Pattern' },
      { name: 'edit_pattern', routeName: 'Edit Pattern' },
      { name: 'delete_pattern', routeName: 'Delete Pattern' },

      { name: 'view_device_condition', routeName: 'View Device Condition' },
      { name: 'view_device_status', routeName: 'View Device Status' },

      {
        name: 'view_repair_requests',
        routeName: 'View Repair Requests',
      },

      { name: 'create_repair_request', routeName: 'Create Repair Request' },
      { name: 'delete_repair_request', routeName: 'Delete Repair Request' },
      {
        name: 'update_repair_device_status',
        routeName: 'Update Repair Device Status',
      },
      { name: 'update_repair_request', routeName: 'Update Repair Request' },
      { name: 'delete_procurement_request', routeName: 'Delete Procurement Request'},
      { name: 'manage_procurement_request', routeName: 'Manage Procurement Request'},
    ],

    skipDuplicates: true,
  });
  await permissionsSeed();

  const existingUser = await prisma.user.findUnique({
    where: { email: 'admin@itrack.com' },
  });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        email: 'admin@itrack.com',
        firstName: 'Admin',
        lastName: 'User',
        password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10),
        status: true,
        role: {
          connect: { name: 'admin' },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  } else {
    console.log('User with email admin@itrack.com already exists.');
  }

  if (process.env.SEED_TEST_USERS) {
    for (const testUser of testUsers) {
      const existingTestUser = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      if (!existingTestUser) {
        await prisma.user.create({
          data: testUser,
        });
      } else {
        console.log(`User with email ${testUser.email} already exists.`);
      }
    }
  }

  const defaultPatterns = [
    {
      name: 'Daily',
      frequency: 1,
      unit: 'day',
      description: 'Occurs every day',
    },
    {
      name: 'Daily',
      frequency: 1,
      unit: 'day',
      description: 'Occurs every day',
    },
    {
      name: 'Weekly',
      frequency: 1,
      unit: 'week',
      description: 'Occurs every week',
    },
    {
      name: 'Quarterly',
      frequency: 3,
      unit: 'month',
      description: 'Occurs every three months',
    },
    {
      name: 'Yearly',
      frequency: 1,
      unit: 'year',
      description: 'Occurs every year',
    },
  ];

  for (const pattern of defaultPatterns) {
    await prisma.recurrencePattern.upsert({
      where: { name: pattern.name },
      update: {},
      create: {
        ...pattern,
        isActive: true,
        isDeleted: false,
      },
    });
  }
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
