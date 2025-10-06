import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationProvider";
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { FaBell, FaTicketAlt, FaUser, FaWrench } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import config from "../configs/app.config";

const STORAGE_KEY = 'app_notifications';

const NotificationBell = () => {
  const { notifications, markAsRead, addNotification, setNotifications } = useNotifications();
  const [open, setOpen] = useState(false);
  const bellRef = useRef(null);
  const popupRef = useRef(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState(null);

  const getBaseUrl = () => {
    return window.location.hostname.includes('localhost') 
      ? 'http://localhost:3000' 
      : config.FRONTEND_URL_PROD;
  };

  useEffect(() => {
    const loadLocalNotifications = () => {
      try {
        const savedNotifications = localStorage.getItem(STORAGE_KEY);
        if (savedNotifications) {
          const parsedNotifications = JSON.parse(savedNotifications);
          const mergedNotifications = [...notifications];
          
          parsedNotifications.forEach(notification => {
            const isDuplicate = mergedNotifications.some(n => 
              n.id === notification.id || 
              (n.message === notification.message && 
               n.timestamp === notification.timestamp &&
               n.type === notification.type)
            );
            
            if (!isDuplicate) {
              const timestamp = notification.timestamp || new Date().toISOString();
              mergedNotifications.push({
                ...notification,
                timestamp: timestamp,
                read: Boolean(notification.read)
              });
            }
          });
          
          const sortedMergedNotifications = mergedNotifications.sort((a, b) => {
            const dateA = new Date(a.timestamp || 0).getTime();
            const dateB = new Date(b.timestamp || 0).getTime();
            return dateB - dateA;
          });
          
          setNotifications(sortedMergedNotifications);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setNotifications([]);
      }
    };

    loadLocalNotifications();
  }, []);

  useEffect(() => {
    try {
      if (notifications.length > 0) {
        const notificationsToStore = notifications.map(notification => ({
          ...notification,
          timestamp: notification.timestamp || new Date().toISOString(),
          read: Boolean(notification.read)
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notificationsToStore));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [notifications]);

  const handleMarkAsRead = (notif) => {
   
    if (!notif.read) {
      markAsRead(notif.id);
      const updatedNotifications = notifications.map(n => 
        n.id === notif.id ? { ...n, read: true } : n
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotifications));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const today = new Date();
  const isToday = (date) => {
    const d = new Date(date);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    const dateA = new Date(a.timestamp || 0).getTime();
    const dateB = new Date(b.timestamp || 0).getTime();
    return dateB - dateA;
  });

  const todayNotifications = sortedNotifications.filter((n) => isToday(n.timestamp));
  const olderNotifications = sortedNotifications.filter((n) => !isToday(n.timestamp));

  const filteredTodayNotifications = showUnreadOnly
    ? todayNotifications.filter((n) => !n.read)
    : todayNotifications;
  const filteredOlderNotifications = showUnreadOnly
    ? olderNotifications.filter((n) => !n.read)
    : olderNotifications;

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleNotificationClick = (notification) => {
  const {
    TICKET,
    TICKET_ASSIGNED,
    TICKET_STATUS,
    TICKET_COMPLETED,
    TICKET_REASSIGNED,
    QUOTATION_SUBMITTED,
  } = config.NOTIFICATION_TYPES;

  const ticketTypes = [TICKET, TICKET_ASSIGNED, TICKET_STATUS, TICKET_COMPLETED, TICKET_REASSIGNED];

  if (notification.navigationPath) {
    navigate(notification.navigationPath);
  } else if (ticketTypes.includes(notification.type)) {
    navigate(`${config.ROUTES.REQUEST_DETAILS}/${notification.item?.requestId}`);
  } else if (notification.type === QUOTATION_SUBMITTED) {
    navigate(config.ROUTES.PROCUREMENT_QUOTATIONS);
  }

  markAsRead(notification._id);
};


  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ticket':
        return <FaTicketAlt className="w-4 h-4" />;
      case 'user':
        return <FaUser className="w-4 h-4" />;
      case 'status':
        return <FaWrench className="w-4 h-4" />;
      default:
        return <FaBell className="w-4 h-4" />;
    }
  };

  const formatNotificationTime = (timestamp) => {
    try {
      if (!timestamp) return 'Just now';
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Just now';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Just now';
    }
  };

  const renderNotificationItem = (notif, index) => (
    <div
      key={index}
      className={`flex items-start gap-3 p-3 rounded-md mb-1 border border-transparent hover:bg-gray-50 transition cursor-pointer ${
        !notif.read ? "border-l-4 border-[#77B634] bg-[#f6fbf2]" : ""
      }`}
      onClick={() => handleNotificationClick(notif)}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-[#77B634]">
        {getNotificationIcon(notif.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-800 text-sm truncate">
              {notif.senderName || "System"}
            </span>
            <span className="text-gray-600 text-sm ml-1 truncate">
              {notif.action}
            </span>
          </div>
          {!notif.read && (
            <span className="ml-2 w-2 h-2 bg-[#77B634] rounded-full flex-shrink-0"></span>
          )}
        </div>
        {(notif.item || notif.message) && (
          <div className="text-xs text-gray-700 mt-0.5">
            {notif.item || notif.message}
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-400">
            {formatNotificationTime(notif.timestamp)}
          </span>
          {notif.status && (
            <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              {notif.status}
            </span>
          )}
          {notif.type === 'ticket' && notif.requestId && (
            <span className="text-xs px-2 py-0.5 rounded bg-[#77B634] text-white">
              Click to view ticket #{notif.requestId}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative" ref={bellRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        aria-label="Show notifications"
      >
        <FaBell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#77B634] text-white text-xs px-2 py-1 rounded-full min-w-[20px] flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={popupRef}
          className="absolute right-0 mt-2 w-[420px] bg-white shadow-2xl p-0 rounded-lg max-h-[520px] overflow-y-auto z-50 border border-gray-100"
        >
          <div className="sticky top-0 bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-base text-gray-800">Notifications</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Only show unread</span>
              <button
                className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-200 ${
                  showUnreadOnly ? "bg-[#77B634]" : "bg-gray-200"
                }`}
                onClick={() => setShowUnreadOnly((prev) => !prev)}
                aria-label="Toggle unread only"
              >
                <span
                  className={`h-4 w-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    showUnreadOnly ? "translate-x-5" : ""
                  }`}
                />
              </button>
              {unreadCount > 0 && (
                <span className="ml-2 bg-[#77B634] text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>

          <div className="px-1 py-2">
            {notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8">
                <FaBell className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No notifications</p>
              </div>
            )}

            {filteredTodayNotifications.length > 0 && (
              <>
                <div className="text-xs text-gray-400 font-semibold mb-1 mt-2 px-2">
                  Today
                </div>
                {filteredTodayNotifications.map((notif, index) => renderNotificationItem(notif, index))}
              </>
            )}

            {filteredOlderNotifications.length > 0 && (
              <>
                <div className="text-xs text-gray-400 font-semibold mb-1 mt-3 px-2">
                  Older
                </div>
                {filteredOlderNotifications.map((notif, index) => renderNotificationItem(notif, index))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
