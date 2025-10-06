import * as yup from 'yup';

const idSchema = yup.object({
  id: yup.number().required().positive().integer(),
});

const procurementRequestSchema = yup.object().shape({
  procurementRequestItemIds: yup
    .array()
    .of(yup.number().positive().integer())
    .min(1, 'Procurement Request Item IDs are required'),
  justification: yup.string().required('Justification is required').trim(),
  expectedDelivery: yup
    .date()
    .required('Expected Delivery is required')
    .test(
      'is-future',
      'Expected Delivery must be a date in the future',
      (value) => {
        if (!value) return false;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return value > now;
      },
    ),
  createdByID: yup.number().required('User ID is required'),
});

const procurementRequestUpdateSchema = yup.object().shape({
  justification: yup.string().required('Justification is required').trim(),
  expectedDelivery: yup
    .date()
    .required('Expected Delivery is required')
    .test(
      'is-future',
      'Expected Delivery must be a date in the future',
      (value) => {
        if (!value) return false;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return value > now;
      },
    ),
});

const procurementRequestItemSchema = yup.object().shape({
  deviceType: yup
    .object()
    .shape({
      id: yup.string().required('Device Type ID is required'),
    })
    .required('Device Type is required'),
  submittedBy: yup.string().required('User ID is required'),
  quantity: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' ? undefined : Number(originalValue),
    )
    .positive('Quantity must be a positive number')
    .required('Quantity is required'),
});

const procurementRequestItemUpdateSchema = yup.object().shape({
  deviceType: yup
    .object()
    .shape({
      id: yup.string().required('Device Type ID is required'),
    })
    .required('Device Type is required'),
  quantity: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' ? undefined : Number(originalValue),
    )
    .positive('Quantity must be a positive number')
    .required('Quantity is required'),
});

const createValidator =
  (schema, dataSource = 'body') =>
  async (req, res, next) => {
    try {
      await schema.validate(req[dataSource], { abortEarly: false });
      next();
    } catch (error) {
      const formattedError = {
        type: 'VALIDATION_ERROR',
        message:
          error.errors && error.errors.length > 0
            ? error.errors.join(', ')
            : 'Validation failed',
        details: error.inner
          ? error.inner.map((err) => ({
              path: err.path,
              message: err.message,
            }))
          : [],
      };

      return res.status(400).json(formattedError);
    }
  };

export const validateId = createValidator(idSchema, 'params');
export const validateProcurementItemsRequest = createValidator(
  procurementRequestItemSchema,
);
export const validateProcurementRequest = createValidator(
  procurementRequestSchema,
);
export const validateProcurementRequestItemUpdate = createValidator(
  procurementRequestItemUpdateSchema,
);

export const validateProcurementRequestUpdate = createValidator(
  procurementRequestUpdateSchema,
);
