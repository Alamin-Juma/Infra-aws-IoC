import React, { useState } from "react";
import projectLogo from "../assets/logo.png";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BadgeDollarSign } from "lucide-react";
import {
  PERMISSION_REVIEW_REQUEST,
  PERMISSION_ALL,
  PERMISSION_MANAGE_USERS,
  PERMISSION_VIEW_INVENTORY_REPORTS,
  PERMISSION_VIEW_PROCUREMENT_REQUESTS,
  PERMISSION_SUBMIT_PROCUREMENT_REQUEST,
  PERMISSION_EVALUATE_VENDOR,
  PERMISSION_VIEW_PURCHASE_ORDERS,
  PERMISSION_VIEW_QUOTATIONS,
  PERMISSION_MANAGE_VENDOR_CONTRACTS,
  PERMISSION_VIEW_DASHBOARD_ANALYTICS,
  PERMISSION_VIEW_DEVICE_TYPES,
  PERMISSION_VIEW_DEVICE_SPECS,
  PERMISSION_MANAGE_DEVICES,
  PERMISSION_VIEW_MANUFACTURERS,
  PERMISSION_VIEW_ROLES,
  PERMISSION_VIEW_REPORTS,
  PERMISSION_VIEW_EXTERNAL_REQUESTS,
  PERMISSION_VIEW_REQUEST_TYPE,
  PERMISSION_VIEW_VENDORS,
  PERMISSION_VIEW_VENDOR_EVALUATIONS,
  PERMISSION_VIEW_DEVICE_STATUS,
  PERMISSION_VIEW_DEVICE_ACTIVITY,
  PERMISSION_VIEW_DEVICE_CONDITION,
  PERMISSION_VIEW_MANUFACTURER_INVENTORY,
  PERMISSION_GROUP_PROCUREMENT_MANAGEMENT,
  PERMISSION_GROUP_FINANCE_MANAGEMENT,
  PERMISSION_GROUP_USER_MANAGEMENT,
  PERMISSION_GROUP_INVENTORY_MANAGEMENT,
  PERMISSION_MANAGE_EXTERNAL_REQUEST,
  PERMISSION_VIEW_PREVENTIVE_MAINTENANCE,
  PERMISSION_MANAGE_MAINTENANCE,
  PERMISSION_VIEW_SCHEDULE,
  PERMISSION_VIEW_MAINTENANCE_HISTORY,
  PERMISSION_MANAGE_REPAIR_REQUESTS,
  PERMISSION_MANAGE_INVENTORY_AUDIT,
} from "../constants/permissions.constants.js";
import { APP_VERSION } from "../constants/general.constants.js";

const Sidebar = () => {
  const { user, userPermissions } = useAuth();
  const location = useLocation();

  const isActiveSubmenu = (path) => {
    if (path === "/app/procurement/procurement-requests") {
      return (
        location.pathname === path ||
        location.pathname.includes("/app/procurement/procurement-requests/")
      );
    }
    if (path === "/app/procurement/procurement-request") {
      return (
        location.pathname === path ||
        location.pathname.includes("/app/procurement/procurement-request")
      );
    }
    if (path === "/app/procurement/vendor-evaluation") {
      return location.pathname.startsWith("/app/procurement/vendor-evaluation");
    }
    if (path === "/app/finance-approval/quotation-list") {
      return location.pathname.startsWith(
        "/app/finance-approval/quotation-list"
      );
    }
    if (path === "/app/finance-approval/po-list") {
      return location.pathname.startsWith("/app/finance-approval/po-list");
    }
    if (path === "/app/inventory/devices") {
      return location.pathname.startsWith("/app/inventory/devices");
    }

    return location.pathname === path;
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/app/dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 opacity-75 rounded-md"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h7v7H3V3zM3 14h7v7H3v-7zM14 3h7v7h-7V3zM14 14h7v7h-7v-7z"
          />
        </svg>
      ),
      allowedPermissions: [PERMISSION_VIEW_DASHBOARD_ANALYTICS],
    },
    {
      label: "External Requests",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 opacity-75"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2a7 7 0 00-7 7v1m14-1a7 7 0 00-7-7m-5 9v1a2 2 0 002 2h6a2 2 0 002-2v-1m-4 5h-2a1 1 0 000 2h2a1 1 0 000-2z"
          />
        </svg>
      ),
      hasBagde: false,
      allowedPermissions: [PERMISSION_VIEW_EXTERNAL_REQUESTS],
      children: [
        {
          label: "Pending",
          path: "/app/external-requests/approvals",
          allowedPermissions: [PERMISSION_MANAGE_EXTERNAL_REQUEST],
        },
        {
          label: "Requests",
          path: "/app/external-requests",
          allowedPermissions: [PERMISSION_VIEW_EXTERNAL_REQUESTS],
        },
      ],
    },
    {
      label: "Inventory Management",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 opacity-75"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7l9-4 9 4M4 10h16M4 10v10a1 1 0 001 1h14a1 1 0 001-1V10M9 21V12h6v9"
          />
        </svg>
      ),
      allowedPermissions: [...PERMISSION_GROUP_INVENTORY_MANAGEMENT],
      children: [
        {
          label: "Devices",
          path: "/app/inventory/devices",
          allowedPermissions: [PERMISSION_MANAGE_DEVICES],
        },
        {
          label: "Specifications",
          path: "/app/device/specifications",
          allowedPermissions: [PERMISSION_VIEW_DEVICE_SPECS],
        },
        {
          label: "Manufacturers",
          path: "/app/device/manufacturers",
          allowedPermissions: [PERMISSION_VIEW_MANUFACTURERS],
        },
        {
          label: "Device Types",
          path: "/app/device/device-type",
          allowedPermissions: [PERMISSION_VIEW_DEVICE_TYPES],
        },
      ],
    },
    {
      label: "Preventive Maintenance",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 opacity-75"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.59 2.59a2 2 0 00-2.83 0l-1.42 1.42a1.999 1.999 0 000 2.83L9.17 8l-5.58 5.59a2 2 0 102.83 2.83L12 10.83l1.17 1.17a1.999 1.999 0 002.83 0l1.42-1.42a2 2 0 000-2.83L14.59 2.59z"
          />
        </svg>
      ),
      hasBagde: false,
      allowedPermissions: [PERMISSION_VIEW_PREVENTIVE_MAINTENANCE],
      children: [
        {
          label: "Recurrence Patterns",
          path: "/app/preventive-maintenance/recurrence-patterns",
          allowedPermissions: [PERMISSION_MANAGE_MAINTENANCE],
        },
        {
          label: "Maintenance Schedule",
          path: "/app/preventive-maintenance/schedule",
          allowedPermissions: [PERMISSION_VIEW_SCHEDULE],
        },
        {
          label: "Maintenance History",
          path: "/app/preventive-maintenance/history",
          allowedPermissions: [PERMISSION_VIEW_MAINTENANCE_HISTORY],
        },
        {
          label: "Repair Request Logging",
          path: "/app/preventive-maintenance/repair-request",
          allowedPermissions: [PERMISSION_MANAGE_REPAIR_REQUESTS],
        },
        {
          label: "Inventory Audit",
          path: "/app/preventive-maintenance/inventory-audit",
          allowedPermissions: [PERMISSION_MANAGE_INVENTORY_AUDIT],
        },
      ],
    },
    {
      label: "Procurement Management",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-container-icon lucide-container"
        >
          <path d="M22 7.7c0-.6-.4-1.2-.8-1.5l-6.3-3.9a1.72 1.72 0 0 0-1.7 0l-10.3 6c-.5.2-.9.8-.9 1.4v6.6c0 .5.4 1.2.8 1.5l6.3 3.9a1.72 1.72 0 0 0 1.7 0l10.3-6c.5-.3.9-1 .9-1.5Z" />
          <path d="M10 21.9V14L2.1 9.1" />
          <path d="m10 14 11.9-6.9" />
          <path d="M14 19.8v-8.1" />
          <path d="M18 17.5V9.4" />
        </svg>
      ),
      allowedPermissions: [...PERMISSION_GROUP_PROCUREMENT_MANAGEMENT],
      children: [
        {
          label: "IT Requests",
          path: "/app/procurement/request-items",
          allowedPermissions: [PERMISSION_SUBMIT_PROCUREMENT_REQUEST],
        },
        {
          label: "Procurement Requests",
          path: "/app/procurement/requests",
          allowedPermissions: [PERMISSION_VIEW_PROCUREMENT_REQUESTS],
        },
        {
          label: "Approved Procurement Requests",
          path: "/app/procurement/procurement-requests",
          allowedPermissions: [PERMISSION_VIEW_PROCUREMENT_REQUESTS],
        },

        {
          label: "Quotes",
          path: "/app/procurement/quotations",
          allowedPermissions: [PERMISSION_VIEW_QUOTATIONS],
        },
        {
          label: "Vendor Registry",
          path: "/app/vendors/vendor-registry",
          allowedPermissions: [PERMISSION_VIEW_VENDORS],
        },

        {
          label: "Vendor Evaluation",
          path: "/app/procurement/vendor-evaluation",
          allowedPermissions: [PERMISSION_VIEW_VENDOR_EVALUATIONS],
        },
      ],
    },
    {
      label: "Finance Approval",
      icon: <BadgeDollarSign className="w-6 h-6 text-gray-500" />,
      allowedPermissions: [...PERMISSION_GROUP_FINANCE_MANAGEMENT],
      children: [
        {
          label: "Quotes",
          path: "/app/finance-approval/quotation-list",
          allowedPermissions: [PERMISSION_VIEW_QUOTATIONS],
        },
        {
          label: "PO List",
          path: "/app/finance-approval/po-list",
          allowedPermissions: [PERMISSION_VIEW_PURCHASE_ORDERS],
        },
      ],
    },
    {
      label: "User Management",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 opacity-75"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      allowedPermissions: [...PERMISSION_GROUP_USER_MANAGEMENT],
      children: [
        {
          label: "Employees",
          path: "/app/users/employees",
          allowedPermissions: [PERMISSION_MANAGE_USERS],
        },
        {
          label: "Roles",
          path: "/app/users/roles",
          allowedPermissions: [PERMISSION_VIEW_ROLES],
        },
      ],
    },
    {
      label: "Reports",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 opacity-75"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 17v-3m4 3v-6m4 6v-9M3 21h18M3 3h18M3 8h18"
          />
        </svg>
      ),
      allowedPermissions: [PERMISSION_VIEW_REPORTS],
      children: [
        {
          label: "Inventory Overview",
          path: "/app/reports/inventory-overview",
          allowedPermissions: [PERMISSION_VIEW_REPORTS],
        },
        {
          label: "Device Assignment",
          path: "/app/reports/device-assignment",
          allowedPermissions: [PERMISSION_VIEW_REPORTS],
        },
        {
          label: "Device History",
          path: "/app/report/devices-report",
          allowedPermissions: [PERMISSION_VIEW_REPORTS],
        },
        {
          label: "Lost & Broken Devices",
          path: "/app/reports/lost-broken-devices",
          allowedPermissions: [PERMISSION_VIEW_REPORTS],
        },
        {
          label: "Manufacturer",
          path: "/app/reports/manufacturer-inventory",
          allowedPermissions: [
            PERMISSION_VIEW_REPORTS,
            PERMISSION_VIEW_DEVICE_STATUS,
            PERMISSION_VIEW_DEVICE_ACTIVITY,
            PERMISSION_VIEW_DEVICE_CONDITION,
            PERMISSION_VIEW_MANUFACTURER_INVENTORY,
          ],
        },
      ],
    },
    {
      label: "Settings",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 opacity-75"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      allowedPermissions: [PERMISSION_VIEW_REQUEST_TYPE],
      children: [
        {
          label: "Request Types",
          path: "/app/settings/request-types",
          allowedPermissions: [PERMISSION_VIEW_REQUEST_TYPE],
        },
      ],
    },
  ];

  const isActive = (item) => {
    if (!item.children) return false;
    if (item.label === "Procurement Management") {
      if (
        location.pathname.startsWith("/app/procurement/procurement-request")
      ) {
        return item.children.some(
          (child) => child.path === "/app/procurement/requests"
        );
      }
      return item.children.some(
        (child) =>
          location.pathname.startsWith("/app/procurement/vendor-evaluation") ||
          location.pathname === child.path ||
          location.pathname.includes(
            "/app/procurement/procurement-requests/"
          ) ||
          location.pathname.startsWith("/app/procurement/requests") ||
          location.pathname.includes("/app/procurement/procurement-request/")
      );
    }
    if (item.label === "Finance Approval") {
      return item.children.some(
        (child) =>
          location.pathname.startsWith(
            "/app/finance-approval/quotation-list/"
          ) ||
          location.pathname === child.path ||
          location.pathname.includes("/app/finance-approval/po-list/")
      );
    }
    if (item.label === "Inventory Management") {
      return item.children.some(
        (child) =>
          location.pathname.startsWith("/app/inventory/devices/") ||
          location.pathname === child.path ||
          location.pathname.includes("/app/inventory/devices/")
      );
    }
    return item.children.some((child) => location.pathname === child.path);
  };

  const [openMenus, setOpenMenus] = useState(() => {
    const initialOpenMenus = {};
    menuItems.forEach((item) => {
      if (item.children) {
        initialOpenMenus[item.label] = isActive(item);
      }
    });
    return initialOpenMenus;
  });

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside className="sidebar-sticky sidebar justify-start bg-[#F0F7EE]">
      <section className="sidebar-content min-h-[20rem]">
        <nav className="menu rounded-md">
          <section className="menu-section px-4">
            <ul className="menu-items">
              {menuItems
                .filter((item) => {
                  return userPermissions.some((permission) =>
                    item.allowedPermissions.includes(permission.toLowerCase())
                  );
                })
                .map((item) => (
                  <li key={item.label}>
                    {item.children ? (
                      <>
                        <input
                          id={`menu-${item.label}`}
                          className="menu-toggle"
                        />
                        <label
                          className="menu-item justify-between cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMenu(item.label);
                          }}
                          style={{ transition: "none" }}
                        >
                          <div className="flex gap-2">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                          <span className="menu-icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </label>

                        <div
                          className={`menu-item-collapse ${
                            openMenus[item.label] ? "block" : "hidden"
                          }`}
                          style={{ transition: "none" }}
                        >
                          <div className="min-h-0">
                            {item.children
                              .filter((subItem) => {
                                return subItem.allowedPermissions.every(
                                  (permission) =>
                                    userPermissions
                                      .map((userPermission) =>
                                        userPermission.toLowerCase()
                                      )
                                      .includes(permission.toLowerCase())
                                );
                              })
                              .map((subItem) => (
                                <NavLink
                                  data-test={`state${subItem.label}`}
                                  key={subItem.label}
                                  to={subItem.path}
                                  onClick={(e) => e.stopPropagation()}
                                  className={`menu-item ml-6 ${
                                    isActiveSubmenu(subItem.path)
                                      ? "bg-[#77B634] text-white font-bold"
                                      : ""
                                  }`}
                                  style={{ transition: "none" }}
                                >
                                  <label
                                    className="menu-item ml-6"
                                    style={{ transition: "none" }}
                                  >
                                    {subItem.label}
                                  </label>
                                </NavLink>
                              ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <NavLink
                        className={`menu-item ${
                          isActiveSubmenu(item.path)
                            ? "bg-[#77B634] text-white"
                            : ""
                        }`}
                        to={item.path}
                        onClick={(e) => e.stopPropagation()}
                        style={{ transition: "none" }}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.hasBagde && (
                          <span class="badge badge-primary">5</span>
                        )}
                      </NavLink>
                    )}
                  </li>
                ))}
            </ul>
          </section>
        </nav>
      </section>
      <section className="sidebar-footer bg-[#F0F7EE] pt-0">
        <div className="divider my-0"></div>
        <div className="dropdown z-50 flex h-fit w-full cursor-pointer hover:bg-gray-4">
          <label
            className="whites mx-2 flex h-fit w-full cursor-pointer p-0 hover:bg-gray-4"
            tabIndex="0"
          >
            <div className="flex flex-row gap-4 p-4">
              <div className="flex flex-col">
                <span>Itrack Device Inventory</span>
                <span className="text-xs font-normal text-content2">
                  {APP_VERSION}
                </span>
              </div>
            </div>
          </label>
        </div>
      </section>
    </aside>
  );
};

export default Sidebar;
