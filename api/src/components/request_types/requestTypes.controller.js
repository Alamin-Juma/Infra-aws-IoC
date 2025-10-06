import requestTypeService from './requestTypes.service.js';

// Create a new RequestType
export const createRequestType = async (req, res) => {
  const { name, label, restrict, authorizedRoles, status } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const lowercaseName = name.toLowerCase();

    const requestType = await requestTypeService.createRequestType({
      name: lowercaseName,
      label,
      restrict: restrict || false,
      authorizedRoles: authorizedRoles || [],
      status: status ?? true,
    });

    res.status(201).json(requestType);
  } catch (error) {
    console.error('Create Request Type Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Get all RequestTypes
export const getAllRequestTypes = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const result = await requestTypeService.getAllRequestTypes(
      Number(page),
      Number(limit),
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch RequestTypes' });
  }
};

// Get a RequestType by ID
export const getRequestTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const requestType = await requestTypeService.getRequestTypeById(id);
    if (!requestType) {
      return res.status(404).json({ error: 'RequestType not found' });
    }
    res.json(requestType);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch RequestType' });
  }
};

export const verify = async (req, res) => {
  const { email } = req.query;

  try {
    const response = await requestTypeService.verifyUser(email);
    res.status(response.status).json(response);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

export const updateRequestType = async (req, res) => {
  const { id } = req.params;
  const { name, label, restrict, authorizedRoles, status } = req.body;

  try {
    const lowercaseName = name ? name.toLowerCase() : undefined;

    const updatedRequestType = await requestTypeService.updateRequestType(id, {
      name: lowercaseName,
      label,
      restrict: restrict || false,
      authorizedRoles: authorizedRoles || [],
    });
    res.status(200).json(updatedRequestType);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update RequestType', error });
  }
};

// Delete a RequestType by ID
export const deleteRequestType = async (req, res) => {
  const { id } = req.params;

  try {
    await requestTypeService.deleteRequestType(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete RequestType', error });
  }
};
