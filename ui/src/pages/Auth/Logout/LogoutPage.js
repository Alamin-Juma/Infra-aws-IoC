import React from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../../configs/app.config';


const LogoutPage = () => {

     const navigate = useNavigate();

     const ACCESS_TOKEN_NAME = config.ACCESS_TOKEN_NAME;
     const USER_ROLE = config.USER_ROLE;

     localStorage.removeItem(ACCESS_TOKEN_NAME); 
     localStorage.removeItem(USER_ROLE); 

     navigate('/auth/login');

};

export default LogoutPage;