import * as yup from 'yup';
import { AppError } from '../../middleware/errorHandler.js';  

const idSchema = yup.object({
  id: yup
    .number()
    .positive('ID must be a positive number')
    .integer('ID must be an integer')
    .required('ID is required'),
});

const validateId = async (req, res, next) => {
  try {
    await idSchema.validate(req.params, { abortEarly: false });
    next();
  } catch (error) {
    return next(new AppError(400, error.message));  
  }
};

export { validateId };
