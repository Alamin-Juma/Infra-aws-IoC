import express from 'express';
import userRoutes from './src/components/user/user.route.js';
import roleRoutes from './src/components/role/role.route.js';
import uploadCSVRoute from './src/components/uploadCSV/uploadCSV.route.js';
import passwordResetRoute from './src/components/password_reset/password_reset.route.js';
import { authenticateToken } from './src/middleware/auth.js';
import { checkPermissions } from './src/middleware/checkPermissions.js';
import loginRoutes from './src/components/login/login.route.js';
import deviceSpecRoutes from './src/components/device_specifications/specification.route.js';
import deviceTypeRoute from './src/components/deviceType/devicetypeRoute.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import Health from './src/components/health/health.js';
import manufacturerRoute from './src/components/manufacturer/manufacturer.route.js';
import deviceHistoryRoutes from './src/components/deviceHistory/deviceHistoryroute.js';
import deviceRoutes from './src/components/device/deviceRoute.js';
import deviceConditionRoutes from './src/components/deviceCondition/deviceConditionRoutes.js';
import deviceStatusRoute from './src/components/device_status/deviceStatusRoute.js';
import assignDeviceRoutes from './src/components/assign_device/assignDevice.route.js';
import emailRoutes from './src/components/email/email.route.js';
import requestTypeRoutes from './src/components/request_types/requestTypes.route.js';
import externalRequestRoute from './src/components/external_requests/externalRequest.route.js';
import deviceActivityRoute from './src/components/device_activity/deviceActivityRoutes.js';
import quotationRoutes from './src/components/quotation/quotationRoute.js';
import procurementRequestRoutes from './src/components/procurementRequest/procurementRequestRoute.js';
import vendorRoutes from './src/components/vendor/vendorRoute.js';
import vendorDevices from './src/components/vendorDevice/vendorDeviceRouter.js';
import auditTrails from './src/components/auditTrail/auditTrailRoute.js';
import auditLogRoutes from './src/components/audit_log/auditLog.routes.js';
import historyRoutes from './src/components/deviceHistoryReport/historyReportRoute.js';
import reportRoutes from './src/components/manufactureReport/manufactureReportRoute.js';
import dashboardStatsRoutes from './src/components/dashboard_stats/dashboardStatsRoutes.js';
import assignmentReport from './src/components/deivice_assignment_report/deviceAssignment.route.js';
import procurementRequestsRoutes from './src/components/procurement_requests/procurementRequests.route.js';
import vendorRegisterRoute from './src/components/vendor_register/vendorRegister.route.js';
import quotationRoute from './src/components/finance_approval/quotation.route.js';
import purchaseOrderRoute from './src/components/finance_approval/purchaseOrder.route.js';
import vendorEvaluations from "./src/components/vendorEvaluation/vendorEvaluationRouter.js";
import contractManagementRoutes from './src/components/contract_management/contractManagementRoutes.js';
import recurrencePattern from './src/components/recurrence_pattern/recurrencePattern.route.js';
import maintenanceScheduleRoutes from './src/components/maintenanceSchedule/maintenanceSchedule.route.js';
import repairRequestRoutes from './src/components/repairRequests/repairRequest.route.js';


import { setupSwagger } from './src/configs/swagger.js';
import {
  errorHandler,
  notFoundHandler,
} from './src/middleware/errorHandler.js';

dotenv.config();
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_PROD,
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

let notifications = {};

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('sendNotification', ({ recipientIds, message, type, requestId, action, timestamp, read, navigationPath, item }) => {
    recipientIds.forEach((recipientId) => {
      if (!notifications[recipientId]) notifications[recipientId] = [];
      notifications[recipientId].push({
        message,
        type,
        requestId,
        action,
        timestamp,
        read,
        navigationPath,
        item
      });

      io.to(recipientId).emit('newNotification', notifications[recipientId]);
    });
  });

  socket.on('markAsRead', (userId) => {
    if (notifications[userId]) {
      notifications[userId] = notifications[userId].map((n) => ({
        ...n,
        read: true,
      }));
      io.to(userId).emit('newNotification', notifications[userId]);
    }
  });

  socket.on('disconnect', () => {
  });
});

if (process.env.NODE_ENV !== 'production') {
  setupSwagger(app);
}

app.use(cors());
app.use(authenticateToken);
app.use(checkPermissions);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.raw({ type: 'application/pdf', limit: '50mb' }));


app.use('/users', userRoutes);
app.use('/roles', roleRoutes);
app.use('/doc', uploadCSVRoute);
app.use('/forgot-password', passwordResetRoute);
app.use('/auth', loginRoutes);
app.use('/health', Health);
app.use('/api/health', Health);
app.use('/api/specifications', deviceSpecRoutes);
app.use('/deviceTypes', deviceTypeRoute);
app.use('/manufacturer', manufacturerRoute);
app.use('/history', deviceHistoryRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/device-condition', deviceConditionRoutes);
app.use('/api/device-status', deviceStatusRoute);
app.use('/assignDevice', assignDeviceRoutes);
app.use('/email', emailRoutes);
app.use('/requestTypes', requestTypeRoutes);
app.use('/externalRequest', externalRequestRoute);
app.use('/deviceActivity', deviceActivityRoute);
app.use('/api/reports', historyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/device-activities', assignmentReport);
app.use('/api/procurements-requests', procurementRequestsRoutes);
app.use('/api/vendors', vendorRegisterRoute);
app.use('/api/reports', historyRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', dashboardStatsRoutes);
app.use('/api/device-activities', assignmentReport);
app.use('/api/quotations', quotationRoutes);
app.use('/api/procurementRequests', procurementRequestRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/vendorDevices', vendorDevices);
app.use('/api/audit-trail', auditTrails);
app.use('/api/audit-trail', auditTrails);
app.use('/api/audit-log', auditLogRoutes)
app.use('/api/vendorEvaluation', vendorEvaluations);
app.use('/api/quotation', quotationRoute);
app.use('/api/purchase-orders', purchaseOrderRoute);
app.use('/api/quotation', quotationRoute);
app.use('/api/purchase-orders', purchaseOrderRoute);
app.use('/api/vendors', contractManagementRoutes);
app.use('/api/vendor-contracts', contractManagementRoutes);
app.use('/api/recurrence-patterns', recurrencePattern);
app.use('/api/maintenance-schedules', maintenanceScheduleRoutes);
app.use('/api/repair-requests', repairRequestRoutes);


app.use(notFoundHandler);
app.use(errorHandler);

export { app, server };
