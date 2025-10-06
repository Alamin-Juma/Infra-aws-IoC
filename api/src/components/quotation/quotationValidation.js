import * as yup from 'yup';

const lineItemSchema = yup.object({
  deviceTypeId: yup
    .number()
    .positive('Device Type ID must be a positive number')
    .required('Device Type ID is required'),
  quantity: yup
    .number()
    .positive('Quantity must be a positive number')
    .required('Quantity is required'),
  unitPrice: yup
    .number()
    .positive('Unit Price must be a positive number')
    .required('Unit Price is required'),
  specification: yup.string().max(255, 'Specification must be less than 255 characters').nullable(),
  justification: yup.string().nullable(),
  expectedDeliveryDate: yup.date().nullable(),
});

const quotationSchema = yup.object({
  vendorId: yup
    .number()
    .positive('Vendor ID must be a positive number')
    .required('Vendor ID is required'),
  submittedById: yup
    .number()
    .positive('Submitted By ID must be a positive number')
    .required('Submitted By ID is required'),
  procurementRequestId: yup.number().positive('Procurement Request ID must be a positive number').nullable(),
  totalAmount: yup
    .number()
    .positive('Total Amount must be a positive number')
    .required('Total Amount is required'),
  status: yup
    .string()
    .oneOf(['Submitted', 'Approved', 'Rejected'], 'Status must be one of "Submitted", "Approved", "Rejected"')
    .default('Submitted'),
  lineItems: yup
    .array()
    .of(lineItemSchema)
    .min(1, 'At least one line item is required')
    .required('Line Items are required'),
});

export { quotationSchema, lineItemSchema };
