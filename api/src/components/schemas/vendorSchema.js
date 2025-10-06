import * as yup from 'yup';

export const vendorSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Vendor name is required'),

  email: yup
    .string()
    .trim()
    .email('Invalid email format')
    .required('Email is required'),

  phone: yup
    .string()
    .nullable(),

  physicalAddress: yup
    .string()
    .trim()
    .required('Physical address is required'),

 

  deviceTypeSupplied: yup
    .array()
    .of(yup.number().typeError('Device type must be a number')),

 
});

export const vendorQuerySchema = yup.object({
    name: yup.string().trim().optional(),
    status: yup.string().oneOf(['ACTIVE', 'INACTIVE', 'ARCHIVE']).optional(),
    expiryBefore: yup.date().typeError('expiryBefore must be a valid date').optional(),
    sortBy: yup.string().oneOf(['name', 'email', 'status', 'contractEndDate']).optional(),
    sortOrder: yup.string().oneOf(['asc', 'desc']).optional(),
    page: yup.number().integer().min(1).optional(),
    limit: yup.number().integer().min(1).max(100).optional(),
  });
  
  export const vendorIdParamSchema = yup.object({
    id: yup
      .string()
      .trim()
      .matches(/^[a-zA-Z0-9-_]+$/, 'Invalid vendor ID format') 
      .required('Vendor ID is required'),
  });
