import * as Yup from 'yup';

export const vendorEvaluationSchema = Yup.object().shape({
  vendorId: Yup.number().required('Vendor ID is required').positive().integer(),
  evaluatorId: Yup.number().required('Evaluator ID is required').positive().integer(),
  deliveryTimeliness: Yup.number()
    .required('Delivery timeliness is required')
    .min(1, 'Delivery timeliness must be between 1 and 5')
    .max(5, 'Delivery timeliness must be between 1 and 5')
    .integer(),
  productQuality: Yup.number()
    .required('Product quality is required')
    .min(1, 'Product quality must be between 1 and 5')
    .max(5, 'Product quality must be between 1 and 5')
    .integer(),
  pricingCompetitiveness: Yup.number()
    .required('Pricing competitiveness is required')
    .min(1, 'Pricing competitiveness must be between 1 and 5')
    .max(5, 'Pricing competitiveness must be between 1 and 5')
    .integer(),
  customerService: Yup.number()
    .required('Customer service is required')
    .min(1, 'Customer service must be between 1 and 5')
    .max(5, 'Customer service must be between 1 and 5')
    .integer(),
  comments: Yup.string().nullable(), // Optional comments field, can be empty or null
});



