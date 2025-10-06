export const handleResponse = ({ res, status = 200, data = null, message = null }) => {
    res.status(status).json({
      success: true,
      message,
      data
    });
  };
  
  export const handleError = ({ res, error, status = 500, message = 'An error occurred' }) => {
    res.status(status).json({
      success: false,
      message,
      error: error.message
    });
  };

  export default{
    handleResponse,
    handleError
  }

