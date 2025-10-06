import * as yup from 'yup';

const createRoleSchema = yup.object().shape({
  permissions: yup
    .array()
    .of(yup.number().positive().integer())
    .min(1, 'Permissions are required'),
  roleName: yup.string().required('Role Name is required').trim(),
});

const updateRoleSchema = yup.object().shape({
  permissions: yup
    .array()
    .of(yup.number().positive().integer())
    .min(1, 'Permissions are required'),
  name: yup.string().required('Role Name is required').trim(),
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

export const validateCreateRole = createValidator(createRoleSchema);
export const validateUpdateRole = createValidator(updateRoleSchema);
