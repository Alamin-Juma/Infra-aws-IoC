export const validateDeviceId = (req, res, next) => {
    const { deviceId } = req.params;
  
    if (!deviceId || isNaN(Number(deviceId))) {
      return res.status(400).json({ message: "Invalid or missing deviceId" });
    }
  
    next();
  };
