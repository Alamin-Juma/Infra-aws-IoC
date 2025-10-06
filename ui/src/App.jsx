import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationProvider";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { InactivityMonitor } from "./components/InactivityMonitor";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <InactivityMonitor />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </>
  );
}

function AppContent() {
  const { user } = useAuth();
  const userId = user?.id;

  return (
    <NotificationProvider userId={userId}>
      <RouterProvider router={router} />
      <ToastContainer  position="top-right" autoClose={1000}/>
    </NotificationProvider>
  );
}

export default App;
