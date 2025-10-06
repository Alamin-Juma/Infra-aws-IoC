import { describe, it, expect, vi, beforeEach } from 'vitest';
import deviceTypeService from './deviceTypeService.js';
import { createDeviceType, deleteDeviceType, getAllDeviceTypes, getDeviceTypeById, updateDeviceType } from './deviceTypeController.js';

const mockRequest = (params = {}, body = {}) => ({ params, body });
const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn();
  return res;
};

vi.mock('./deviceTypeService.js');

describe('DeviceType Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get all device types", async () => {
    const mockReq = { query: { page: "1", limit: "10" } }; 
    const mockRes = mockResponse();
    
    const mockDeviceTypes = {
      data: [
        { id: 1, name: "Laptop" },
        { id: 2, name: "Smartphone" }
      ],
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1
    };
  
   
    deviceTypeService.getAllDeviceTypes.mockResolvedValue(mockDeviceTypes);
  
    await getAllDeviceTypes(mockReq, mockRes);
    expect(mockRes.json).toHaveBeenCalledWith(mockDeviceTypes);
  });
  

  it('should return a device type by ID', async () => {
    const req = mockRequest({ id: '1' });
    const res = mockResponse();
    const mockData = { id: 1, name: 'Laptop' };

    deviceTypeService.getDeviceTypeById.mockResolvedValue(mockData);

    await getDeviceTypeById(req, res);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  it('should create a new device type', async () => {
    const req = mockRequest({}, { name: 'Tablet' });
    const res = mockResponse();
    const mockData = {  id: 2, name: 'Tablet' };

    deviceTypeService.createDeviceType.mockResolvedValue(mockData);

    await createDeviceType(req, res);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  it('should update a device type', async () => {
    const req = mockRequest({ id: '1' }, { name: 'Smartphone' });
    const res = mockResponse();
    const mockData = { id: 1, name: 'Smartphone' };

    deviceTypeService.updateDeviceType.mockResolvedValue(mockData);

    await updateDeviceType(req, res);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  it('should delete a device type', async () => {
    const req = mockRequest({ id: '1' });
    const res = mockResponse();

    deviceTypeService.deleteDeviceType.mockResolvedValue();

    await deleteDeviceType(req, res);
    expect(res.json).toHaveBeenCalledWith({ message: 'Device type deleted successfully' });
  });
});
