export const ROLE_ADMIN = ["admin", "Admin"];
export const ROLE_USER = ["user", "User"];
export const ROLE_FINANCE = ["finance", "Finance"];
export const ROLE_PROCUREMENT = ["procurement", "Procurement"];
export const ROLE_IT = ["it_staff", "It_Staff"];
export const ROLE_EMPLOYEE = ["employee", 'Employee'];
export const ROLES = {
  ADMIN: ROLE_ADMIN,
  USER: ROLE_USER,
  FINANCE: ROLE_FINANCE,
};

export const ROLE_GROUP_ADMIN = [...ROLE_ADMIN];
export const ROLE_GROUP_ADMIN_AND_USER = [...ROLE_ADMIN, ...ROLE_USER];
export const ROLE_GROUP_ADMIN_AND_FINANCE = [...ROLE_ADMIN, ...ROLE_FINANCE];
export const ROLE_GROUP_GENERAL = [...ROLE_ADMIN, ...ROLE_FINANCE, ...ROLE_USER, ...ROLE_IT, ...ROLE_PROCUREMENT];
