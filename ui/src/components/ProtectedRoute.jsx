import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';
import { useEffect } from "react";
import { PERMISSION_VIEW_DASHBOARD_ANALYTICS } from "../constants/permissions.constants";

const ProtectedRoute = ({ allowedPermissions }) => {
    const { user, loading, hasPermissions } = useAuth();
    const navigate = useNavigate();

    if (loading) return <p>Loading...</p>;

    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    useEffect(() => {
        if (!loading && !hasPermissions(allowedPermissions)) {
            toast.error("You do not have permission to access this resource. Contact the administrator.", {
                autoClose: 3000,
            });
            
            navigate(hasPermissions([PERMISSION_VIEW_DASHBOARD_ANALYTICS]) ? "/app/dashboard" : "/");
        }
    }, [loading, allowedPermissions, hasPermissions, navigate]);
    if (!loading && !hasPermissions(allowedPermissions)) {
        return null;
    }

    return <Outlet />;

};

export default ProtectedRoute;
