import { RepairDeviceStatus, RepairRequestStatus } from "@prisma/client";
import { AppError } from '../../middleware/errorHandler.js';
import * as Yup from 'yup';

export const listRepairRequestsValidationSchema = Yup.object().shape({
    page: Yup.number().optional().positive().integer().default(1),
    limit: Yup.number().optional().positive().integer().default(10),
    status: Yup.string().optional().oneOf(Object.values(RepairRequestStatus), "Repair request status is invalid"),
    dateFrom: Yup.date()
        .max(new Date(), "Date from cannot be in the future")
        .optional(),
    dateTo: Yup.date()
        .min(Yup.ref("dateFrom"), "Date to must be after or equal to date from")
        .max(new Date(), "Date to cannot be in the future")
        .optional(),
    assignedTo: Yup.number().optional().positive().integer(),
});


export const getRepairRequestByIdValidationSchema = Yup.object().shape({
    id: Yup.number().optional().positive().integer().default(1),
});
 
export const repairRequestSchema = Yup.object().shape({
  description: Yup
    .string()
    .min(10, "Description must be at least 10 characters")
    .required("Please provide a description for this request"),

  assignedTo: Yup
    .number()
    .optional()
    .positive("Assignee Id must be a positive number"),

  severity: Yup
    .string()
    .transform(value => value?.toUpperCase())
    .oneOf(['LOW','MEDIUM','HIGH', 'CRITICAL'], 'Status must be one of "LOW", "MEDIUM", "HIGH", "CRITICAL"')
    .required("Please indicate the severity of this request"),

  location: Yup
    .string()
    .optional()
    .max(255, 'Location exceeds max length'),

  deviceType: Yup
    .number()
    .required("Please provide a valid device type")
    .positive("Device type must be a positive number"),

  affectedDevices: Yup
    .array("Please provide at least one device")
    .of(
      Yup
        .number()
        .typeError("Each device must be a valid number")
        .positive("Device ID must be a positive number")
    )
    .min(1, "Please add at least one device to this repair request")
    .test('unique', 'Device IDs must be unique',
      (value) => {
        if (!value) return true;
        const unique = new Set(value);
        return unique.size === value.length;
      }
    ).required("Please add at least one device to this repair request")
});

export const deleteRepairRequestByIdValidationSchema = Yup.object().shape({
    id: Yup.number("Request Id must be a number")
    .required("Request Id is required")
    .positive("Request Id must be a positive number")
    .integer("Request id must be an integer"),
});


export const updateRepairRequestDeviceStatusPathValidationSchema = Yup.object().shape({
  id: Yup.number().required().positive().integer(),
  deviceId: Yup.number().required().positive().integer(),
});

export const updateRepairRequestDeviceStatusBodyValidationSchema = Yup.object().shape({
  status: Yup.string()
    .required()
    .oneOf(
      Object.values(RepairDeviceStatus),
      'Repair request device status is invalid',
    ),
});

/**
 * The following is the state transitions for repair request device status
 * to ensure only valid transitions are allowed.
 */
const repairRequestDeviceStatusTransitions = {
  [RepairDeviceStatus.PENDING]: [
    RepairDeviceStatus.IN_PROGRESS,
    RepairDeviceStatus.ASSIGNED_TO_VENDOR,
  ],
  [RepairDeviceStatus.IN_PROGRESS]: [
    RepairDeviceStatus.FIXED,
    RepairDeviceStatus.RETIRED,
    RepairDeviceStatus.ASSIGNED_TO_VENDOR,
  ],
  [RepairDeviceStatus.ASSIGNED_TO_VENDOR]: [
    RepairDeviceStatus.FIXED,
    RepairDeviceStatus.RETIRED,
  ],
  [RepairDeviceStatus.FIXED]: [],
  [RepairDeviceStatus.RETIRED]: [],
};


/**
 * Validate repair device status transitions
 * @returns {boolean} - true if transition is valid
 * @throws {AppError} - true if transition not allowed
 */
export function isValidRepairDeviceStatusTransition(currentStatus, nextStatus) {
  const allowedTransitions = repairRequestDeviceStatusTransitions[currentStatus];

  if (!allowedTransitions) {
    throw new AppError(
      'VALIDATION_ERROR',
      `Unknown current status: ${currentStatus}`,
    );
  }

  const allowed =  allowedTransitions.includes(nextStatus);
  if (!allowed) {
    throw new AppError(
      'VALIDATION_ERROR',
      `Status transition from ${currentStatus} to ${nextStatus} is not allowed.`,
    );
  }

  return allowed;
}

export const updateRepairRequestSchema = Yup.object().shape({
  deviceType: Yup.number()
    .positive('Device type must be a positive number')
    .integer('Device type must be an integer'),

  severity: Yup.string()
    .transform((value) => value?.toUpperCase())
    .oneOf(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], 'Severity must be one of "LOW", "MEDIUM", "HIGH", "CRITICAL"'),

  description: Yup.string()
    .min(10, 'Description must be at least 10 characters'),

  location: Yup.string()
    .nullable(),

  assignedTo: Yup.number()
    .nullable()
    .integer('AssignedTo must be an integer')
    .positive('AssignedTo must be a positive number'),

  affectedDevices: Yup.array()
    .of(
      Yup.number()
        .typeError('Each device must be a valid number')
        .positive('Device ID must be a positive number')
        .integer('Device ID must be an integer')
    )
    .min(1, 'Please add at least one device to this repair request')
    .test(
      'unique',
      'Device IDs must be unique',
      (value) => {
        if (!value) return true;
        const unique = new Set(value);
        return unique.size === value.length;
      }
    )
});
