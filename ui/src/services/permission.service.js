export const getUserPermissions = () => {
    const userPermissions = localStorage.getItem("permissions");
    return userPermissions?.split(',');
} 