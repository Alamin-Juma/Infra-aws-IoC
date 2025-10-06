import React from 'react';
import { Navigate } from 'react-router-dom';
import config from '../configs/app.config';

const ACCESS_TOKEN_NAME = config.ACCESS_TOKEN_NAME;

const withAuth = (WrappedComponent, isAuthLayout) => {
  return function WithAuthComponent(props) {
    const isAuthenticated = !!localStorage.getItem(ACCESS_TOKEN_NAME); // Use this in production

    // If the route is for the Auth Layout (e.g., login, register)
    if (isAuthLayout) {
      // If the user is authenticated, redirect them away from auth routes (e.g., login)
      if (isAuthenticated) {
        return <Navigate to="/app/dashboard" />;
      }
      // If the user is not authenticated, allow them to access the auth route
      return <WrappedComponent {...props} />;
    }

    // If the route is for the Main Layout (e.g., dashboard, profile)
    if (!isAuthenticated) {
      // If the user is not authenticated, redirect them to the login page
      return <Navigate to="/auth/login" />;
    }

    // If the user is authenticated, allow them to access the main layout route
    return <WrappedComponent {...props} />;
  };
};


export default withAuth;


