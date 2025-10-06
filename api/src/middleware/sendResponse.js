const sendResponse = (res, statusCode, message, data = null) => {
  const responseData = data === undefined ? null : data;
  const response = {
    success: true,
    message: message,
    data: responseData,
  };

  res.status(statusCode).json(response);
};

export default sendResponse;
