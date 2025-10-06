import React, { createContext, useContext, useState, useEffect } from "react";
import { getUserPermissions } from "../services/permission.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userPermissions, setUserPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshAuthContext, setRefreshAuthContext] = useState(false);

    const setupContext = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) {
                setUser(storedUser);
            }
            const storedPermissions = await getUserPermissions();
            if(storedPermissions) {
                setUserPermissions(storedPermissions);
            }
        } catch (e) {
            setLoading(false);
            setRefreshAuthContext(false);
        } finally {
            setLoading(false);
            setRefreshAuthContext(false);
        }
    };

    useEffect(() => {
        setupContext()
    }, []);

    useEffect(() => {
        if(refreshAuthContext){
            setLoading(true);
            setupContext();
        }
    }, [refreshAuthContext]);

    return (
        <AuthContext.Provider value={{ user, 
                                       userPermissions,
                                       forceRefreshAuthContext: () => {
                                            setRefreshAuthContext(true);
                                       },
                                       hasPermissions: (allowedPermissions) => {
                                            return userPermissions.some(permission => allowedPermissions.includes(permission.toLowerCase()))
                                       },
                                       setUser, 
                                       loading
                                    }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

