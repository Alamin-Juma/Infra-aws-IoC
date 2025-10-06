import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppRoutes from './app';
import LandingRoutes from './landing';
import AuthRoutes from './auth';
import NotFoundPage from '../pages/NotFound/NotFoundPage';




const router = createBrowserRouter([
    {
        path: '',
        children: LandingRoutes,
    },
    {
        path: 'auth',
        children: AuthRoutes
    },
    {
        path: 'app',
        children: AppRoutes
    },
    {
        path: '*',
        element: <NotFoundPage />
    }
])


export default router;


