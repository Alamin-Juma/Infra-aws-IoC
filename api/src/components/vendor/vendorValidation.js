import * as yup from 'yup';

const idSchema = yup.object({
  id: yup
    .number()
    .positive('ID must be a positive number')
    .integer('ID must be an integer')
    .required('ID is required'),
});

export { idSchema };


