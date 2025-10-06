import api from "../../../../utils/apiInterceptor";

export const fetchRolesService = async (page, limit, search, status) => {
  const response = await api.get(
    `/roles?page=${page}&limit=${limit}&search=${search}&status=${status}`
  );
  return {
    roles: response?.data?.data?.roles,
    total: response?.data?.data?.total,
  };
};
export const fetchAllPermissionsService = async () => {
  const response = await api.get("/roles/permissions?page=1&limit=1000");
  return response?.data?.data?.permissions?.permissions;
};

export const createRoleService = async (data) => {
  const response = await api.post("/roles/create", data);
  return response?.data?.data;
};
