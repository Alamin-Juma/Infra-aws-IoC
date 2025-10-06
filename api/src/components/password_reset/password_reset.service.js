import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Database interaction functions
const getUserByEmail = (email) => prisma.user.findUnique({ where: { email: email } });
const createPasswordReset = (data) => prisma.passwordReset.create({ data });
const getPasswordResetByToken = (token) => prisma.passwordReset.findFirst({
    where: {
        token: token, status: false, expiresAt: {
            gte: new Date()
        }
    }
});
const updateUserPassword = (data) => prisma.user.update(data);
const updateForgotPassword = (data) => prisma.passwordReset.update(data);

export default {
    getUserByEmail,
    createPasswordReset,
    getPasswordResetByToken,
    updateUserPassword,
    updateForgotPassword
};
