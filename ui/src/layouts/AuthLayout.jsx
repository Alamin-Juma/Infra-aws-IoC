import React from 'react'
import { Outlet } from 'react-router-dom'


const AuthLayout = ({children}) => {
  return (
    <div>   
     {children || <Outlet />}
    </div>
  )
}

export default AuthLayout
