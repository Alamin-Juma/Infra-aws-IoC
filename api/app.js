import dotenv from 'dotenv';
dotenv.config();

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.raw({ type: 'application/pdf', limit: '50mb' }));

// Health check endpoint (outside /api for ALB health checks)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Create API router
const apiRouter = express.Router();

// Health check inside /api
apiRouter.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Auth routes (no authentication required)
apiRouter.use('/auth', loginRoutes);
apiRouter.use('/forgot-password', passwordResetRoute);

// Apply authentication middleware to all routes after this point
apiRouter.use(authenticateToken);
apiRouter.use(checkPermissions);

// Protected routes
apiRouter.use('/users', userRoutes);
apiRouter.use('/roles', roleRoutes);
apiRouter.use('/doc', uploadCSVRoute);
apiRouter.use('/specifications', deviceSpecRoutes);
apiRouter.use('/deviceTypes', deviceTypeRoute);
apiRouter.use('/manufacturer', manufacturerRoute);
apiRouter.use('/history', deviceHistoryRoutes);
apiRouter.use('/devices', deviceRoutes);
apiRouter.use('/device-condition', deviceConditionRoutes);
apiRouter.use('/device-status', deviceStatusRoute);
apiRouter.use('/assignDevice', assignDeviceRoutes);
apiRouter.use('/email', emailRoutes);
apiRouter.use('/requestTypes', requestTypeRoutes);
apiRouter.use('/externalRequest', externalRequestRoute);
apiRouter.use('/deviceActivity', deviceActivityRoute);
apiRouter.use('/reports', historyRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/device-activities', assignmentReport);
apiRouter.use('/procurements-requests', procurementRequestsRoutes);
apiRouter.use('/vendors', vendorRegisterRoute);
apiRouter.use('/analytics', dashboardStatsRoutes);
apiRouter.use('/quotations', quotationRoutes);
apiRouter.use('/procurementRequests', procurementRequestRoutes);
apiRouter.use('/vendors', vendorRoutes);
apiRouter.use('/vendorDevices', vendorDevices);
apiRouter.use('/audit-trail', auditTrails);
apiRouter.use('/audit-log', auditLogRoutes);
apiRouter.use('/vendorEvaluation', vendorEvaluations);
apiRouter.use('/quotation', quotationRoute);
apiRouter.use('/purchase-orders', purchaseOrderRoute);
apiRouter.use('/vendor-contracts', contractManagementRoutes);
apiRouter.use('/recurrence-patterns', recurrencePattern);
apiRouter.use('/maintenance-schedules', maintenanceScheduleRoutes);
apiRouter.use('/repair-requests', repairRequestRoutes);

// Mount all API routes under /api
app.use('/api', apiRouter);


app.use(notFoundHandler);
app.use(errorHandler);

export { app, server };
