import React, { useEffect } from "react";
import config from "../configs/app.config";
import InactivityWarningModal from "./InactivityWarningModal";
import { useInactivityMonitor } from "../hooks/InactivityMonitor";
import Swal from "sweetalert2";

const EXCLUDED_ROUTES = ["/auth/login", "/"];

export function InactivityMonitor() {
  const isExcludedRoute = EXCLUDED_ROUTES.includes(window.location.pathname);

  const logoutClick = () => {
    localStorage.clear();
    window.location.href = "/auth/login";
  };
  const handleLogout = () => {
    if (localStorage.getItem(config.ACCESS_TOKEN_NAME)) {
      localStorage.clear();
      Swal.fire({
        icon: "warning",
        title: "Logged Out",
        text: "You have been logged out due to inactivity.",
        confirmButtonColor: "#77b634",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.href = "/auth/login";
      });
    }
  };

  const {
    isWarningVisible,
    remainingTime,
    handleStaySignedIn,
    handleLogout: handleManualLogout,
    triggerWarning,
  } = useInactivityMonitor({
    timeout: config.INACTIVITY_TIME * 1000,
    warningTime: config.INACTIVITY_WARNING_TIME * 1000,
    onLogout: handleLogout,
  });

  useEffect(() => {}, [isWarningVisible]);

  if (isExcludedRoute || !localStorage.getItem(config.ACCESS_TOKEN_NAME)) {
    return null;
  }

  return (
    <>
      <InactivityWarningModal
        isOpen={isWarningVisible}
        remainingTime={remainingTime}
        onStaySignedIn={handleStaySignedIn}
        onLogout={logoutClick}
      />
    </>
  );
}
