import { describe, it, expect, vi } from 'vitest';
import validateDeviceType from './deviceTypeMiddleware.js';

const mockRequest = (body = {}) => ({ body });
const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn();
  return res;
};
const mockNext = vi.fn();

describe('DeviceType Middleware', () => {
  it('should pass validation with a valid name', () => {
    const req = mockRequest({ name: 'Laptop' });
    const res = mockResponse();

    validateDeviceType(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should return error if name is missing', () => {
    const req = mockRequest({});
    const res = mockResponse();

    validateDeviceType(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Device type name is required' });
  });

  it('should return error if name is empty', () => {
    const req = mockRequest({ name: '' });
    const res = mockResponse();

    validateDeviceType(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Device type name is required' });
  });

  it('should return error if name is only whitespace', () => {
    const req = mockRequest({ name: '   ' });
    const res = mockResponse();

    validateDeviceType(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Device type name is required' });
  });
});
