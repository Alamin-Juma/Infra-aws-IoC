import React from 'react';
import LoginPage from '../pages/Auth/Login/LoginPage';
import ForgotPasswordPage from '../pages/Auth/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage from '../pages/Auth/ResetPassword/ResetPasswordPage';

const AuthRoutes = [
    {
        path: "login",
        element: <LoginPage />
    },
    {
        path: "forgot-password",
        element: <ForgotPasswordPage />
    },
    {
        path: "reset-password/:token",
        element: <ResetPasswordPage />
    }
]

export default AuthRoutes;

