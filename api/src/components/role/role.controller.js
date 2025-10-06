import config from '../../configs/app.config.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import sendResponse from '../../middleware/sendResponse.js';
import RoleService from './role.service.js';

export const createRole = asyncHandler(async (req, res) => {
  const role = await RoleService.createRole(req.body, req.user);
  return sendResponse(res, 201, role);
});

export const getRoles = asyncHandler(async (req, res) => {
  const {
    page = config.PAGE || 1,
    limit = config.PAGE_LIMIT || 10,
    search = '',
    status = '',
  } = req.query;
  const rolesData = await RoleService.getRoles(
    parseInt(page),
    parseInt(limit),
    search,
    status,
  );
  return sendResponse(res, 200, 'Roles fetched successfully', rolesData);
});

export const getRoleById = asyncHandler(async (req, res) => {
  const role = await RoleService.getRoleById(req.params.id);
  if (!role) return sendResponse(res, 404, 'Role not found');
  return sendResponse(res, 200, 'Role fetched successfully', role);
});

export const updateRole = async (req, res) => {
  const updatedRole = await RoleService.updateRole(req.params.id, req.body, req.user);
  return sendResponse(res, 200, 'Role updated successfully', updatedRole);
};

export const deleteRole = asyncHandler(async (req, res) => {
  await RoleService.deleteRole(req.params.id);
  return sendResponse(res, 204, 'Role deleted successfully');
});

export const toggleRoleStatus = asyncHandler(async (req, res) => {
  const updatedRole = await RoleService.toggleRoleStatus(Number(req.params.id));
  return sendResponse(
    res,
    200,
    'Role status updated successfully',
    updatedRole,
  );
});

export const getAllPermissions = asyncHandler(async (req, res) => {
  const { page = config.PAGE || 1, limit = config.PAGE_LIMIT || 10 } =
    req.query;
  const permissions = await RoleService.getAllPermissionsSerivce(page, limit);
  if (!permissions) return sendResponse(res, 404, 'Permissions not found');
  return sendResponse(res, 200, 'Permissions fetched successfully', {
    permissions,
  });
});

export const getRolePermissions = asyncHandler(async (req, res) => {
  const permissions = await RoleService.getRolePermissions(req.params.id);
  return sendResponse(res, 200, 'Permissions fetched successfully', {
    permissions,
  });
});
