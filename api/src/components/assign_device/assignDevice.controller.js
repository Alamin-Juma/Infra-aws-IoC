import inventoryService from "./assignDevice.service.js";

export const assignDevice = async (req, res) => {
 
    try {
      const result = await inventoryService.assignDevice(req.params.id,  req.body);
  
      // Return success response
      res.status(200).json({
        message: 'Device assigned successfully',
        device: result.device,
        activity: result.activity,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  export const unassignDevice = async (req, res) => {

    const {performedBy} = req.body;
 
    try {
      const result = await inventoryService.unassignDevice(req.params.id,performedBy);

      
  
      // Return success response
      res.status(200).json({
        message: 'Device unassigned successfully',
        device: result.device,
        activity: result.activity,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
