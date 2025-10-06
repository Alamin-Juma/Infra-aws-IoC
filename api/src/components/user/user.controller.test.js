import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as userController from './user.controller.js';
import userService from './user.service.js'; 
// Mock the user service
vi.mock('./user.service.js');

describe('User Controller', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Create fresh request/response objects for each test
    mockReq = {
      query: {},
      params: {},
      body: {}
    };
    
    mockRes = {
      json: vi.fn(),
      status: vi.fn(() => mockRes),
      send: vi.fn()
    };
  });

  describe('getAllUsers', () => {
    it('should return paginated users with default values', async () => {
      const mockUsers = [{ id: 1, name: 'User 1' }];
      const mockTotal = 10;
      userService.getAllUsers.mockResolvedValue([mockUsers, mockTotal]);

      await userController.getAllUsers(mockReq, mockRes);

      expect(userService.getAllUsers).toHaveBeenCalledWith(1, 10);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Users fetched successfully',
        users: mockUsers,
        total: mockTotal,
        page: 1,
        limit: 10,
      });
    });

    it('should handle custom pagination values', async () => {
      mockReq.query = { page: '2', limit: '5' };
      userService.getAllUsers.mockResolvedValue([[], 0]);

      await userController.getAllUsers(mockReq, mockRes);

      expect(userService.getAllUsers).toHaveBeenCalledWith(2, 5);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      userService.getAllUsers.mockRejectedValue(error);

      await userController.getAllUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getUserById', () => {
    it('should return a user when found', async () => {
      const mockUser = { id: 1, name: 'Test User' };
      mockReq.params.id = '1';
      userService.getUserById.mockResolvedValue(mockUser);

      await userController.getUserById(mockReq, mockRes);

      expect(userService.getUserById).toHaveBeenCalledWith('1');
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 when user not found', async () => {
      mockReq.params.id = '999';
      userService.getUserById.mockResolvedValue(null);

      await userController.getUserById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle errors', async () => {
      mockReq.params.id = '1';
      const error = new Error('Database error');
      userService.getUserById.mockRejectedValue(error);

      await userController.getUserById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('createUser', () => {
    it('should create a new user and return 201 status', async () => {
      const mockUserData = { firstName: 'New',lastName: 'User', email: 'test@example.com',roleName:'employee' };
      const mockCreatedUser = { id: 1, ...mockUserData };
      mockReq.body = mockUserData;
      userService.createUser.mockResolvedValue(mockCreatedUser);

      await userController.createUser(mockReq, mockRes);

      expect(userService.createUser).toHaveBeenCalledWith(mockUserData,undefined);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockCreatedUser);
    });

    it('should handle errors', async () => {
      mockReq.body = {};
      const error = new Error('A required field is missing.');
      userService.createUser.mockRejectedValue(error);

      await userController.createUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'A required field is missing.' });
    });
  });

  describe('updateUser', () => {
    it('should update a user and return the updated user', async () => {
      const mockUpdateData = { firstName: 'Updated',lastName: 'Name', email: 'test@example.com',roleName:'employee' };

      const mockUpdatedUser = { id: 1, ...mockUpdateData };
      mockReq.params.id = '1';
      mockReq.body = mockUpdateData;
      userService.updateUser.mockResolvedValue(mockUpdatedUser);

      await userController.updateUser(mockReq, mockRes);

      expect(userService.updateUser).toHaveBeenCalledWith('1', mockUpdateData, undefined);
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedUser);
    });

    it('should handle errors', async () => {
      mockReq.params.id = '1';
      mockReq.body = {};
      const error = new Error('Update failed');
      userService.updateUser.mockRejectedValue(error);

      await userController.updateUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Update failed' });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return 204 status', async () => {
      mockReq.params.id = '1';
      userService.deleteUser.mockResolvedValue(true);

      await userController.deleteUser(mockReq, mockRes);

      expect(userService.deleteUser).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockReq.params.id = '1';
      const error = new Error('Deletion failed');
      userService.deleteUser.mockRejectedValue(error);

      await userController.deleteUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Deletion failed' });
    });
  });

  describe('getActiveUsers', () => {
    it('should return active users with pagination', async () => {
      const mockActiveUsers = [{ id: 1, name: 'Active User', isActive: true }];
      const mockTotal = 5;
      mockReq.query = { page: '2', limit: '5' };
      userService.getActiveUsers.mockResolvedValue([mockActiveUsers, mockTotal]);

      await userController.getActiveUsers(mockReq, mockRes);

      expect(userService.getActiveUsers).toHaveBeenCalledWith(2, 5);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Active users fetched successfully',
        users: mockActiveUsers,
        total: mockTotal,
        page: 2,
        limit: 5,
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Active users error');
      userService.getActiveUsers.mockRejectedValue(error);

      await userController.getActiveUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Active users error' });
    });
  });

  describe('updateUserToAdmin', () => {
    it('should update user to admin with valid data', async () => {
      const mockUpdatedUser = { id: 1, role: 'admin' };
      mockReq.body = { email: 'test@example.com', roleId: 2 };
      userService.updateUserToAdmin.mockResolvedValue(mockUpdatedUser);

      await userController.updateUserToAdmin(mockReq, mockRes);

      expect(userService.updateUserToAdmin).toHaveBeenCalledWith('test@example.com', 2);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'User status and role updated successfully',
        user: mockUpdatedUser,
      });
    });

    it('should return 400 when email or roleId is missing', async () => {
      mockReq.body = { email: 'test@example.com' };

      await userController.updateUserToAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email and role ID are required' });
    });

    it('should return 404 when user not found', async () => {
      mockReq.body = { email: 'nonexistent@example.com', roleId: 2 };
      userService.updateUserToAdmin.mockRejectedValue(new Error('User not found'));

      await userController.updateUserToAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle other errors', async () => {
      mockReq.body = { email: 'test@example.com', roleId: 2 };
      userService.updateUserToAdmin.mockRejectedValue(new Error('Database error'));

      await userController.updateUserToAdmin(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found by email', async () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      mockReq.query = { email: 'test@example.com' };
      userService.getUserByEmail.mockResolvedValue(mockUser);

      await userController.getUserByEmail(mockReq, mockRes);

      expect(userService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockRes.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 400 when email is missing', async () => {
      mockReq.query = {};

      await userController.getUserByEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email is required' });
    });

    it('should return 404 when user not found', async () => {
      mockReq.query = { email: 'nonexistent@example.com' };
      userService.getUserByEmail.mockRejectedValue(new Error('User not found'));

      await userController.getUserByEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle other errors', async () => {
      mockReq.query = { email: 'test@example.com' };
      userService.getUserByEmail.mockRejectedValue(new Error('Database error'));

      await userController.getUserByEmail(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('filterUsers', () => {
    it('should filter users with all parameters', async () => {
      const mockFilteredUsers = [{ id: 1, name: 'Filtered User' }];
      const mockTotal = 1;
      mockReq.query = { 
        page: '1', 
        limit: '10', 
        roleName: 'admin', 
        keyword: 'test' 
      };
      userService.filterUsers.mockResolvedValue([mockFilteredUsers, mockTotal]);

      await userController.filterUsers(mockReq, mockRes);

      expect(userService.filterUsers).toHaveBeenCalledWith(1, 10, 'admin', 'test');
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Users filtered successfully',
        users: mockFilteredUsers,
        total: mockTotal,
        page: 1,
        limit: 10,
      });
    });

    it('should filter users with partial parameters', async () => {
      const mockFilteredUsers = [{ id: 1, name: 'Filtered User' }];
      const mockTotal = 1;
      mockReq.query = { 
        page: '1', 
        limit: '10', 
        keyword: 'test' 
      };
      userService.filterUsers.mockResolvedValue([mockFilteredUsers, mockTotal]);

      await userController.filterUsers(mockReq, mockRes);

      expect(userService.filterUsers).toHaveBeenCalledWith(1, 10, undefined, 'test');
    });

    it('should handle errors', async () => {
      mockReq.query = {};
      const error = new Error('Filter error');
      userService.filterUsers.mockRejectedValue(error);

      await userController.filterUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Filter error' });
    });
  });
});
