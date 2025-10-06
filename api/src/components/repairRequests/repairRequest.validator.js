import { RepairRequestStatus } from "@prisma/client";
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
    )
});

export const deleteRepairRequestByIdValidationSchema = Yup.object().shape({
    id: Yup.number("Request Id must be a number")
    .required("Request Id is required")
    .positive("Request Id must be a positive number")
    .integer("Request id must be an integer"),
});


