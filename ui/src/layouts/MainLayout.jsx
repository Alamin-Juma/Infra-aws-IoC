import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (sidebarOpen) setSidebarOpen(false);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white overflow-hidden">

     
      <header className="sticky top-0 z-50 w-full bg-[#F0F7EE] shadow-sm">
        <div className="py-2 px-4 flex justify-between items-center">
          <Navbar toggleSidebar={toggleSidebar} />
        </div>
      </header>

      
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div
          className={`
            ${sidebarOpen ? 'block' : 'hidden'} 
            sm:block sm:w-64 flex-shrink-0 
            transition-all duration-300 ease-in-out 
            bg-[#F0F7EE]
          `}
        >
          <Sidebar />
          {sidebarOpen && (
            <div
              className="sm:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={toggleSidebar}
            />
          )}
        </div>

      
        <main
          onClick={closeSidebar}
          className="flex-1 overflow-y-auto overflow-x-auto p-4 
                    [&::-webkit-scrollbar]:w-2 
                    [&::-webkit-scrollbar-thumb]:bg-[#77B634] 
                    [&::-webkit-scrollbar-track]:bg-[#F0F7EE]"
        >
          {children || <Outlet />}
        </main>
      </div>

     
      <ToastContainer position="top-right" />
    </div>
  );
};

export default MainLayout;
