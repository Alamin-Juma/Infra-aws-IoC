import * as yup from 'yup';

const createAuditTrailSchema = yup.object({
  activity: yup.string().required('Activity is required').max(255, 'Activity should be less than 255 characters'),
  performedBy: yup.number().positive().integer().required('PerformedBy (User ID) is required'),
  note: yup.string().nullable().max(500, 'Note should be less than 500 characters'),
});

const paginationSchema = yup.object({
  page: yup.number().positive().integer().default(1),
  limit: yup.number().positive().integer().default(10),
  search: yup.string().nullable().max(255, 'Search term should be less than 255 characters'),
});

export { createAuditTrailSchema, paginationSchema };
