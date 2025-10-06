import { describe, it, expect, vi, beforeEach } from 'vitest';
import deviceService from './deviceService.js';
import { createDevice, updateDevice, deleteDevice } from './deviceController.js';

const mockRequest = (body = {}, params = {}, query = {}) => ({ body, params, query });
const mockResponse = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

vi.mock('./deviceService.js', () => ({
    default: {
        createDevice: vi.fn(),
        updateDevice: vi.fn(),
        deleteDevice: vi.fn(),
        getAllDevices: vi.fn(),
        getDeviceById: vi.fn(),
        getDeviceHistoryBySerial: vi.fn(),
        updateDeviceCondition: vi.fn(),
        getDeviceCountByType: vi.fn()
    }
}));

describe('Device Controller', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should successfully create a device', async () => {
        const req = mockRequest({ serialNumber: 'ABC123' });
        const res = mockResponse();
        
        deviceService.createDevice.mockResolvedValue({ id: 1, serialNumber: 'ABC123' });
        await createDevice(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ message: 'Device added successfully', device: { id: 1, serialNumber: 'ABC123' } });
    });

    it('should return an error when createDevice fails', async () => {
        const req = mockRequest({ serialNumber: 'DEF456' });
        const res = mockResponse();

        deviceService.createDevice.mockRejectedValue(new Error('Error saving device'));
        await createDevice(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error saving device', error: 'Error saving device' });
    });

    it('should update an existing device', async () => {
        const req = mockRequest({ serialNumber: 'XYZ789' }, { id: 1 });
        const res = mockResponse();

        deviceService.updateDevice.mockResolvedValue({ id: 1, serialNumber: 'XYZ789' });
        await updateDevice(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Device updated successfully', device: { id: 1, serialNumber: 'XYZ789' } });
    });

    it('should return an error if updating a device fails', async () => {
        const req = mockRequest({}, { id: 1 });
        const res = mockResponse();

        deviceService.updateDevice.mockRejectedValue(new Error('Error updating device'));
        await updateDevice(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error updating device', error: 'Error updating device' });
    });

    it('should delete a device successfully', async () => {
        const req = mockRequest({}, { id: 1 });
        const res = mockResponse();

        deviceService.deleteDevice.mockResolvedValue();
        await deleteDevice(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'Device deleted successfully' });
    });

    it('should return an error if deleting a device fails', async () => {
        const req = mockRequest({}, { id: 1 });
        const res = mockResponse();

        deviceService.deleteDevice.mockRejectedValue(new Error('Error deleting device'));
        await deleteDevice(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting device', error: 'Error deleting device' });
    });
});
