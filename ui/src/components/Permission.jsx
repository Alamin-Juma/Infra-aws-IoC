import { useAuth } from "../context/AuthContext";

const Permission = ({ children, allowedPermission }) => {
     const { hasPermissions } = useAuth();
     return hasPermissions(allowedPermission) ? children : null;
};

export default Permission;