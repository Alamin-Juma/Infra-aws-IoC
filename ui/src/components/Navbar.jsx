import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserAlt, FaBars } from "react-icons/fa";
import NotificationBell from "./NotificationBell";
import projectLogo from "../assets/logo.png";

const Navbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.clear();

        navigate('/auth/login');
    };

    const getGreeting = () => {
        const currentTime = new Date();
        const currentHour = currentTime.getHours();

        if (currentHour >= 5 && currentHour < 12) {
            return "Good Morning";
        } else if (currentHour >= 12 && currentHour < 18) {
            return "Good Afternoon";
        } else {
            return "Good Evening";
        }
    }

    const formatName = (name) => {
        if (!name) return "Guest";
        return `${name.charAt(0).toUpperCase()}${name.slice(1).toLowerCase()}`;
    };

    return (
        <div className="navbar bg-[#F0F7EE] shadow-none h-18 px-4 flex justify-between items-center">
  
        
        <div className="flex items-center gap-4">
        <img src={projectLogo} alt="Logo" className="h-20 w-auto -ml-3" />

          
          <button 
            className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={toggleSidebar}
          >
            <FaBars className="text-xl" />
          </button>
        </div>
      

        <div className="flex items-center gap-4">
          <span className="text-black text-md">
            {getGreeting()}, <b>{formatName(user?.firstName)}</b>
          </span>
      
          <NotificationBell />
      
          <div className="avatar avatar-ring avatar-md">
            <div className="dropdown-container">
              <div className="dropdown">
                <label className="btn btn-ghost cursor-pointer px-0" tabIndex="0">
                  <FaUserAlt className="text-gray-500 text-2xl" />
                </label>
                <div className="dropdown-menu dropdown-menu-bottom-left">
                  <Link onClick={handleLogout} tabIndex="-1" className="dropdown-item text-sm">
                    Logout
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    )
}

export default Navbar;
