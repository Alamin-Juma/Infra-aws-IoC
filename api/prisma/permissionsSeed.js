import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const permissionsSeed = async () => {
  const roleNames = ['admin', 'it_staff', 'procurement', 'finance', 'user'];

  const permissionMatrix = [
    ['Submit_Request', false, true, false, false, true],
    ['Assign_Requester', true, true, false, false, false],
    ['Review_Request', true, true, true, false, false],
    ['Close_Request', true, true, false, false, false],
    ['Check_Device_Availability', true, true, false, false, false],
    ['Submit_Procurement_Request', true, true, false, false, false],
    ['Approve_Procurement_Request', true, false, false, false, false],
    ['Create_Quotation', false, false, true, false, false],
    ['Approve_Quotation', false, false, false, true, false],
    ['Generate_PO', false, false, false, true, false],
    ['Email_Vendor', true, true, true, false, false],
    ['Receive_Goods', true, true, true, false, false],
    ['Goods_Inspection', true, true, true, false, false],
    ['Review_PO', true, false, false, false, false],
    ['Evaluate_Vendor', true, true, true, false, false],
    ['Update_Inventory', true, true, false, false, false],
    ['Receive_Email_Acknowledgment', true, true, false, false, true],
    ['Manage_Users', true, false, false, false, false],
    ['View_Inventory_Reports', true, true, false, false, false],
    ['Authentication_Login', true, true, true, true, false],
    ['Lockout_After_Failed_Attempts', true, true, true, true, false],

    ['View_Users', true, false, false, false, false],
    ['Create_User', true, false, false, false, false],
    ['Manage_Single_User', true, false, false, false, false],
    ['View_Roles', true, false, false, false, false],
    ['Create_Role', true, false, false, false, false],
    ['Manage_Role', true, false, false, false, false],
    ['Toggle_Role_Status', true, false, false, false, false],
    ['View_Dashboard_Analytics', true, false, false, false, false],
    ['Create_Role', true, false, false, false, false],
    ['Create_Role', true, false, false, false, false],
    ['View Repair Requests', true, false, false, false, false],
    ['Create_Repair_Request', true, false, false, false, false],
    ['Delete_Repair_Request', true, false, false, false, false],
    ['Update_Repair_Request', true, false, false, false, false],

    ['Update Repair Device Status', true, false, false, false, false],
  ];

  // Fetch all roles and permissions in one query each
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      where: { name: { in: roleNames } },
    }),
    prisma.permission.findMany(),
  ]);

  const roleMap = new Map(roles.map((r) => [r.name.toLowerCase(), r.id]));
  const permissionMap = new Map(
    permissions.map((p) => [p.routeName.replace(/ /g, '_'), p.id]),
  );

  // Prepare all rolePermission create/update operations
  const createOperations = [];
  const existingRolePermissions = await prisma.rolePermission.findMany();
  const existingMap = new Map(
    existingRolePermissions.map((rp) => [
      `${rp.roleId}-${rp.permissionId}`,
      rp.id,
    ]),
  );

  for (const [funcName, ...rolePerms] of permissionMatrix) {
    const permissionId = permissionMap.get(funcName);
    if (!permissionId) continue;

    for (let i = 0; i < roleNames.length; i++) {
      if (!rolePerms[i]) continue;

      const roleId = roleMap.get(roleNames[i].toLowerCase());
      if (!roleId) continue;

      const key = `${roleId}-${permissionId}`;
      const existingId = existingMap.get(key);

      if (!existingId) {
        createOperations.push(
          prisma.rolePermission.create({
            data: {
              roleId,
              permissionId,
            },
          }),
        );
      }
    }
  }

  if (createOperations.length > 0) {
    await prisma.$transaction(createOperations);
  }
};
