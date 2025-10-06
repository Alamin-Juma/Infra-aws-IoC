import { PrismaClient } from '@prisma/client';
import config from '../../configs/app.config.js';
import jwt from 'jsonwebtoken';
import { getPermissionsByRoleId } from '../role/role.service.js';
import { createHash, randomBytes } from 'crypto';

const prisma = new PrismaClient();
const jwtSecret = config.jwt_secret;

const getUserByEmail = (email) => prisma.user.findFirst({
    where: { email: email, status: true },
    include: {
        role: true,
    }
});

const getUserById = (userId) => prisma.user.findFirst({
    where: { id: userId, status: true },
    include: {
        role: true,
    }
});

const generateAccessToken = async (user) => {
    const userPermissionsRaw = await getPermissionsByRoleId(user.role.id);
    const userPermissions = userPermissionsRaw.map(permission => permission.name.toUpperCase());
    const jwtPayload = {
        id: user.id,
        username: user.email,
        user: {
            userId: user.id, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            email: user.email
        },
        role: user.role.name,
        permissions: userPermissions
    };
    
    return jwt.sign(jwtPayload, jwtSecret, { expiresIn: '1h' });
}

const generateRefreshToken = async (user) => {
    const token = randomBytes(64).toString('hex');
    const hashedToken = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 1.5);
    const jwtPayload = {
        sub: user.email,
        token: token
    };

    await prisma.refreshToken.create({
        data: {
            token: hashedToken,
            userId: user.id,
            expiresAt,
        }
    });

    return jwt.sign(jwtPayload, jwtSecret, { expiresIn: '1.5h' });
}

const validateRefreshToken = async (refreshToken) => {
    return jwt.verify(refreshToken, jwtSecret, async (err, { token }) => {
        if (err || !token) throw new Error('Invalid or expired refresh token');
        const hashedRefreshToken = createHash('sha256').update(token).digest('hex');
        const storedToken = await prisma.refreshToken.findUnique({
            where: { 
                token: hashedRefreshToken,
                revoked: false,
                expiresAt: {
                    gte: new Date()
                }
            },
        })

        if(!storedToken) {
            throw new Error('Invalid or expired refresh token');
        }

        return storedToken;
    });
}

const rotateRefreshToken = async (token) => {
    await prisma.refreshToken.update({
      where: { token },
      data: { revoked: true }
    });
}

export default {
    getUserByEmail,
    generateAccessToken,
    generateRefreshToken,
    validateRefreshToken,
    rotateRefreshToken,
    getUserById
};
