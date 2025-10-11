import userService from './user.service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import sendResponse from '../../middleware/sendResponse.js';

export const getAllUsers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default page: 1, limit: 10

  try {
    const [users, total] = await userService.getAllUsers(Number(page), Number(limit));

    res.json({
      message: 'Users fetched successfully',
      users,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  const {firstName, lastName, email, roleName} = req.body;

  if (!firstName || !lastName || !email || !roleName) {
    return res.status(400).json({ error: "A required field is missing." });
  }

  try {
    const user = await userService.createUser(req.body, req.user);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = asyncHandler( async (req, res) => {
  try {
    await userService.deleteUser(req.params.id, req.user?.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export const getActiveUsers = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const [activeUsers, total] = await userService.getActiveUsers(Number(page), Number(limit));

    res.json({
      message: 'Active users fetched successfully',
      users: activeUsers,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserToAdmin = async (req, res) => {
  const { email, roleId } = req.body;

  if (!email || !roleId) {
    return res.status(400).json({ error: 'Email and role ID are required' });
  }

  try {
    const updatedUser = await userService.updateUserToAdmin(email, roleId);
    res.json({
      message: 'User status and role updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};


export const getUserByEmail = async (req, res) => {
  const { email } = req.query; // Get email from query parameters

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await userService.getUserByEmail(email);
    res.json(user);
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};


export const filterUsers = async (req, res) => {
  const { page = 1, limit = 10, roleName, keyword } = req.query;

  try {
      const [filteredUsers, total] = await userService.filterUsers(
          Number(page),
          Number(limit),
          roleName,
          keyword
      );

      res.json({
          message: 'Users filtered successfully',
          users: filteredUsers,
          total,
          page: Number(page),
          limit: Number(limit),
      });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const updatedUser = await userService.toggleUserStatus(req);
  return sendResponse(
    res,
    200,
    'User status updated successfully',
    updatedUser,
  );
});
