import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import config from "../configs/app.config";
import React from "react";

const NotificationContext = createContext();
const socket = io(config.API_BASE_URL);

export const NotificationProvider = ({ userId, children }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (userId) {
      socket.emit("join", userId);

      socket.on("newNotification", (data) => {
        setNotifications(data);
      });

      return () => socket.off("newNotification");
    }
  }, [userId]);

  const markAsRead = () => {
    socket.emit("markAsRead", userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
