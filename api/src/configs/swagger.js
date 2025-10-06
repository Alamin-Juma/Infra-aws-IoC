import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import userSchema from '../components/schemas/userSchema.js';
import requestType from '../components/schemas/requestType.js';
import { manufacturerSchema } from '../components/schemas/manufacturerSchema.js';
import {
  LoginRequestSchema,
  LoginResponseSchema,
} from '../components/schemas/loginRequest.js';
import {
  ExternalRequestSchema,
  ExternalRequestCreateSchema,
} from '../components/schemas/externalRequestSchemas.js';
import DeviceTypeSchema from '../components/schemas/deviceTypeSchema.js';
import {
  AssignDeviceRequestSchema,
  AssignDeviceResponseSchema,
  UnassignDeviceResponseSchema,
} from '../components/schemas/assignDeviceSchema.js';
import {
  DeviceStatisticsSchema,
  MonthlyRequestCountsSchema,
  DeviceSummarySchema,
} from '../components/schemas/dashboardStatSchema.js';
import repairRequest from '../components/schemas/repairRequestsSchema.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Itrack API Documentation',
      version: '1.0.0',
      description: 'Comprehensive API documentation for Itrack system',
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:9000',
        description:
          process.env.NODE_ENV === 'production'
            ? 'Production server'
            : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ...userSchema,
        ...requestType,
        Manufacturer: manufacturerSchema,
        ManufacturerCreate: manufacturerSchema,
        ManufacturerUpdate: manufacturerSchema,
        LoginRequest: LoginRequestSchema,
        LoginResponse: LoginResponseSchema,
        ExternalRequest: ExternalRequestSchema,
        ExternalRequestCreate: ExternalRequestCreateSchema,
        DeviceType: DeviceTypeSchema,
        AssignDeviceRequest: AssignDeviceRequestSchema,
        AssignDeviceResponse: AssignDeviceResponseSchema,
        UnassignDeviceResponse: UnassignDeviceResponseSchema,
        DeviceStatistics: DeviceStatisticsSchema,
        MonthlyRequestCounts: MonthlyRequestCountsSchema,
        DeviceSummary: DeviceSummarySchema,
        RepairRequests: repairRequest
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/components/**/*.route.js',
    './src/components/**/*.route.ts',
    './src/components/deviceType/**/*.js',
    './components/schemas/**/*.js',
    './components/schemas/dashboardStatSchema.js',
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, (req, res) => {
    const liveSpecs = swaggerJsdoc(options);
    swaggerUi.setup(liveSpecs)(req, res);
  });

  app.get('/redoc', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>API Documentation</title>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
        </head>
        <body>
          <redoc spec-url='/api-docs-json'></redoc>
          <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"></script>
        </body>
      </html>
    `);
  });

  app.get('/api-docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};
