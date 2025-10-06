const validateDeviceType = (req, res, next) => {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Device type name is required' });
    }
    next();
  };
  
  export default validateDeviceType;
  