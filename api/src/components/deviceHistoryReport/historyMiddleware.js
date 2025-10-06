export const validateQueryParams = (validations) => {
    return (req, res, next) => {
      const errors = [];
      
      validations.forEach(validation => {
        const value = req.query[validation.name];
        
        if (validation.required && !value) {
          errors.push(`${validation.name} is required`);
          return;
        }
        
        if (value) {
          switch (validation.type) {
            case 'date':
              if (isNaN(new Date(value).getTime())) {
                errors.push(`${validation.name} must be a valid date`);
              }
              break;
            case 'number':
              if (isNaN(Number(value))) {
                errors.push(`${validation.name} must be a number`);
              }
              break;
            case 'string':
              if (typeof value !== 'string') {
                errors.push(`${validation.name} must be a string`);
              }
              break;
          }
        }
        
        if (validation.enum && !validation.enum.includes(value)) {
          errors.push(`${validation.name} must be one of: ${validation.enum.join(', ')}`);
        }
      });
      
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
      
      next();
    };
  };
  
  export const validateDeviceHistoryParams = validateQueryParams([
    { name: 'from', type: 'date', required: false },
    { name: 'to', type: 'date', required: false },
    { name: 'serialNumber', type: 'string', required: false },
    { name: 'deviceTypeId', type: 'number', required: false }
  ]);
  
  export const validateExportParams = validateQueryParams([
    { name: 'from', type: 'date', required: false },
    { name: 'to', type: 'date', required: false },
    { name: 'serialNumber', type: 'string', required: false },
    { name: 'deviceTypeId', type: 'number', required: false },
    { name: 'format', type: 'string', required: true, enum: ['csv', 'pdf'] }
  ]);

export default {
    validateQueryParams,
    validateDeviceHistoryParams,
    validateExportParams
}

