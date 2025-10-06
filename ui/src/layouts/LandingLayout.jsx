
import React from 'react';
import { Outlet } from 'react-router-dom';



const LandingLayout = ({children}) => {
  return (
    <div>   
     {children || <Outlet />}
    </div>
  )
}

export default LandingLayout;

