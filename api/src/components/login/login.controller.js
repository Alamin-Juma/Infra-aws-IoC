import loginService from './login.service.js';

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        } 

        const user = await loginService.getUserByEmail(email);
        if (!user) return res.status(401).json({ error: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const accessToken = await loginService.generateAccessToken(user);
        const refreshToken = await loginService.generateRefreshToken(user);

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const storedToken = await loginService.validateRefreshToken(refreshToken);
        const user = await loginService.getUserById(storedToken.userId);
        await loginService.rotateRefreshToken(storedToken.token);
        const newAccessToken = await loginService.generateAccessToken(user);
        const newRefreshToken = await loginService.generateRefreshToken(user);
        res.json({
            message: 'Access token refreshed successfully.',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (e) {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
}
