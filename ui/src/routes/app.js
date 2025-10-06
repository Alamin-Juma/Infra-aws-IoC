import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import AnalyticsPage from "../pages/Dashboard/Analytics/AnalyticsPage";
import AssignedDevicesPage from "../pages/Dashboard/Inventory/AssignedDevices/AssignedDevicesPage";
import DeviceTypes from "../pages/Dashboard/Inventory/DeviceTypes/DeviceTypes";
import Employees from "../pages/Dashboard/Users/Employees/Employees";
import Roles from "../pages/Dashboard/Users/Roles/Roles";
import AdminUsers from "../pages/Dashboard/Users/AdminUsers/AdminUsers";
import SpecificationsPage from "../pages/Dashboard/DeviceManagent/Specifications/SpecificationsPage";
import Manufacturer from "../pages/Dashboard/Inventory/Manufacturer/Manufacturer";
import InventoryListPage from "../pages/Dashboard/Inventory/InventoryList/InventoryListPage";
import DeviceDetails from "../pages/Dashboard/Inventory/DeviceDetails/DeviceDetails";
import RequestTypesPage from "../pages/Dashboard/Settings/RequestTypes";
import Tickets from "../pages/ExternalRequests/Tickets/Tickets";
import TicketDetails from "../pages/ExternalRequests/Tickets/TicketDetails";
import DeviceReport from "../pages/Reports/DeviceReport/DeviceReport";
import LostAndBrokenDevicesReport from "../pages/Reports/LostAndBrokenDevices/LostAndBrokenDevicesReport";
import DeviceAssignment from "../pages/Reports/DeviceAssignment";
import ManufacturerReport from "../pages/Reports/manufacturerReport/ManufacturerReport";
import InventoryOverviewReport from "../pages/Reports/InventoryOverview/InventoryOverviewReport";
import VendorRegistrationPage from "../pages/Vendors/vendorRegistration";
import VendorDetailsPage from "../pages/Vendors/VendorDetails";
import EditVendorPage from "../pages/Vendors/EditVendor";
import ProcurementRequests from "../pages/Dashboard/Procurement/ProcurementRequest/ProcurementRequest";
import ProcurementRequestDetails from "../pages/Dashboard/Procurement/ProcurementRequestDetails/ProcurementRequestDetails";
import QuotationList from "../pages/Dashboard/Procurement/Quotation/QuotationList";
import VendorEvaluation from "../pages/Dashboard/Procurement/VendorEvaluation/VendorEvaluation";
import VendorProfile from "../pages/Dashboard/Procurement/VendorEvaluation/VendorProfile";
import VendorEvaluationForm from "../pages/Dashboard/Procurement/VendorEvaluation/VendorEvaluationForm";
import RequestItems from "../pages/Procurements/RequestItems";
import ProcurementRequest from "../pages/Procurements/ProcurementsRequests";
import FinanceQuotationList from "../pages/Dashboard/FinanceApproval/QuotationList/QuotationList";
import QuotationDetails from "../pages/Dashboard/FinanceApproval/QuotationDetails/QuotationDetails";
import POList from "../pages/Dashboard/FinanceApproval/POList/POList";
import PODetails from "../pages/Dashboard/FinanceApproval/PODetails/PODetails";
import DeviceTypesList from "../pages/Dashboard/Inventory/InventoryList/DeviceTypesList";
import VendorContractManagement from "../components/VendorContractManagement";
import ContractUpload from "../components/ContractUpload";
import ContractList from "../components/ContractList";
import ProcurementViewDetails from "../pages/Procurements/ProcurementViewDetails.js";
import { PERMISSION_CREATE_REQUEST_TYPE, PERMISSION_CREATE_VENDOR, PERMISSION_GROUP_FINANCE_MANAGEMENT, PERMISSION_GROUP_INVENTORY_MANAGEMENT, PERMISSION_GROUP_PROCUREMENT_MANAGEMENT, PERMISSION_GROUP_USER_MANAGEMENT, PERMISSION_MANAGE_EXTERNAL_REQUEST, PERMISSION_MANAGE_REQUEST_TYPE, PERMISSION_MANAGE_VENDOR, PERMISSION_MANAGE_VENDOR_CONTRACTS, PERMISSION_VIEW_DASHBOARD_ANALYTICS, PERMISSION_VIEW_EXTERNAL_REQUESTS, PERMISSION_VIEW_REPORTS, PERMISSION_VIEW_REQUEST_TYPE, PERMISSION_VIEW_VENDORS } from "../constants/permissions.constants.js";
import Approvals from "../pages/ExternalRequests/Approval/Approvals.js";
import RecurrencePatterns from "../pages/PreventiveMaintanace/RecurrencePatterns/RecurrencePatterns.js";
import MaintenanceSchedule from "../pages/PreventiveMaintanace/MaintenanceSchedule/MaintenanceSchedule.js";
import RepairRequestPage from "../pages/PreventiveMaintanace/RepairRequest/RepairRequestPage.jsx";
import RepairRequestDetailsPage from "../pages/PreventiveMaintanace/RepairRequest/RepairRequestDetailsPage.jsx";

const AppRoutes = [
  {
    path: "dashboard",
    element: <ProtectedRoute allowedPermissions={[PERMISSION_VIEW_DASHBOARD_ANALYTICS]} />,
    children: [{ path: "", element: <AnalyticsPage /> }],
  },
  {
    path: "users",
    element: <ProtectedRoute allowedPermissions={[...PERMISSION_GROUP_USER_MANAGEMENT]} />,
    children: [
      { path: "admin-users", element: <AdminUsers /> },
      { path: "employees", element: <Employees /> },
      { path: "roles", element: <Roles /> },
    ],
  },
  {
    path: "device",
    element: <ProtectedRoute allowedPermissions={[...PERMISSION_GROUP_INVENTORY_MANAGEMENT]} />,
    children: [
      { path: "specifications", element: <SpecificationsPage /> },
      { path: "manufacturers", element: <Manufacturer /> },
      { path: "device-type", element: <DeviceTypes /> },
    ],
  },
  {
    path: "inventory",
    element: <ProtectedRoute allowedPermissions={[...PERMISSION_GROUP_INVENTORY_MANAGEMENT]} />,
    children: [
      { path: "devices", element: <InventoryListPage /> },
      { path: "device-details/:id", element: <DeviceDetails /> },
      { path: "assigned-devices", element: <AssignedDevicesPage /> },
      { path: "device-types", element: <DeviceTypes /> },
      { path: "devices/device-types-list", element: <DeviceTypesList /> },
    ],
  },
  {
    path: "preventive-maintenance",
    element: <ProtectedRoute allowedPermissions={[...PERMISSION_GROUP_INVENTORY_MANAGEMENT]} />,
    children: [
      { path: "recurrence-patterns", element: <RecurrencePatterns /> },
      { path: "schedule", element: <MaintenanceSchedule /> },
      { path: "history", element: <RecurrencePatterns /> },
      { path: "repair-request", element: <RepairRequestPage /> },
      { path: "repair-request/:id", element: <RepairRequestDetailsPage /> },
      { path: "inventory-audit", element: <RecurrencePatterns /> },
    ],
  },
  {
    path: "finance-approval",
    element: <ProtectedRoute allowedPermissions={[...PERMISSION_GROUP_FINANCE_MANAGEMENT]} />,
    children: [
      { path: "quotation-list", element: <FinanceQuotationList /> },
      { path: "po-list", element: <POList /> },
      { path: "po-list/po-details/:id", element: <PODetails /> },
      {
        path: "quotation-list/quotation-details/:id",
        element: <QuotationDetails />,
      },
    ],
  },
  {
    path: "external-requests",
    element: <ProtectedRoute allowedPermissions={[PERMISSION_VIEW_EXTERNAL_REQUESTS, PERMISSION_MANAGE_EXTERNAL_REQUEST]} />,
    children: [
      { path: "", element: <Tickets /> },
      { path: "request-details/:id", element: <TicketDetails /> },
      { path: "approvals", element: <Approvals /> },
    ],
  },

  {
    path: "report",
    element: <ProtectedRoute allowedPermissions={[PERMISSION_VIEW_REPORTS]} />,
    children: [{ path: "devices-report", element: <DeviceReport /> }],
  },

  {
    path: "vendors",
    element: <ProtectedRoute allowedPermissions={[PERMISSION_MANAGE_VENDOR, PERMISSION_MANAGE_VENDOR_CONTRACTS, PERMISSION_CREATE_VENDOR, PERMISSION_VIEW_VENDORS]} />,
    children: [
      { path: "contracts", element: <ContractList /> },
      { path: "upload-contract/:id", element: <VendorContractManagement /> },
      { path: "contract-upload", element: <ContractUpload /> },
      {
        path: "vendor-registry",
        element: <VendorRegistrationPage />,
      },
      {
        path: "add-vendor",
        element: <VendorDetailsPage />,
      },
      {
        path: "edit-vendor/:id",
        element: <EditVendorPage />,
      },
    ],
  },

  {
    path: "reports",
    element: <ProtectedRoute allowedPermissions={[PERMISSION_VIEW_REPORTS]} />,
    children: [
      { path: "lost-broken-devices", element: <LostAndBrokenDevicesReport /> },
      { path: "manufacturer-inventory", element: <ManufacturerReport /> },
      { path: "device-assignment", element: <DeviceAssignment /> },
      { path: "inventory-overview", element: <InventoryOverviewReport /> },
    ],
  },
  {
    path: "settings",
    element: <ProtectedRoute allowedPermissions={[PERMISSION_VIEW_REQUEST_TYPE, PERMISSION_CREATE_REQUEST_TYPE, PERMISSION_MANAGE_REQUEST_TYPE]} />,
    children: [{ path: "request-types", element: <RequestTypesPage /> }],
  },

  {
    path: "procurement",
    element: <ProtectedRoute allowedPermissions={[...PERMISSION_GROUP_PROCUREMENT_MANAGEMENT]} />,
    children: [
      {
        path: "requests",
        element: <ProcurementRequest />,
      },
      { path: "request-items", element: <RequestItems /> },
      { path: "procurement-requests", element: <ProcurementRequests /> },
      {
        path: "procurement-requests/:id",
        element: <ProcurementRequestDetails />,
      },
      {
        path: "procurement-request/:id",
        element: <ProcurementViewDetails />,
      },
      { path: "quotations", element: <QuotationList /> },
      { path: "vendor-evaluation", element: <VendorEvaluation /> },
      { path: "vendor-evaluation/profile/:id", element: <VendorProfile /> },
      {
        path: "vendor-evaluation/evaluate/:id",
        element: <VendorEvaluationForm />,
      },
    ],
  },
];

export default AppRoutes;
