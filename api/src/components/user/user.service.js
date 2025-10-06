import { PrismaClient } from '@prisma/client';
import config from '../../configs/app.config.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import password_resetService from '../password_reset/password_reset.service.js';
import bcrypt from 'bcryptjs';
import { attachAuditLogger } from '../audit_log/auditLog.service.js';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email,
    pass: config.app_password,
  },
});

const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: config.email,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Failed to send email');
  }
};

// Database interaction functions
const getAllUsers = (page = 1, limit = 10) => {
  return prisma.$transaction([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        roleName: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count(), // Count total users
  ]);
};

const getUserById = (id) =>
  prisma.user.findUnique({ where: { id: Number(id) } });

export const createUser = async (data, user) => {
  // Check if a user with the same email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  data.password = bcrypt.hashSync(process.env.DEFAULT_USER_PASSWORD, 10);

  if (existingUser) {
    throw new Error('User already exists.');
  }

  const loggedPrismaClient = attachAuditLogger(prisma, user);
  return loggedPrismaClient.user.create({ data });
};

const updateUser = async (id, data, user) => {
  const loggedPrismaClient = attachAuditLogger(prisma, user);
  const currentUser = await prisma.user.findUnique({
    where: { id: Number(id) },
  });
  

  if (!currentUser) {
    throw new Error('User not found');
  }

  let newStatus = currentUser.status;
  const loginEnabledRoles = config.roles.loginEnabled;  
  const isPromotedToLoginRole = !loginEnabledRoles.includes(currentUser.roleName) && loginEnabledRoles.includes(data.roleName);

  const updatedUser = await loggedPrismaClient.user.update({
    where: { id: Number(id) },
    data: {
      ...data,
      status: newStatus,
    },
  });

  if (isPromotedToLoginRole) {
    try {
      const generated_token = generatePasswordResetToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await password_resetService.createPasswordReset({
        userId: updatedUser.id,
        token: generated_token,
        status: false,
        expiresAt: expiresAt,
      });

      await sendSetPasswordEmail(
        updatedUser.email,
        currentUser.firstName,
        generated_token,
      );
    } catch (error) {      
      throw new Error('Failed to send set password email');
    }
  }

  return updatedUser;
};


function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString('hex');
}


async function sendSetPasswordEmail(userEmail, firstName, resetToken) {
  const setPasswordUrl = config.FRONTEND_URL_PROD;
  const setPasswordLink = `${setPasswordUrl}/auth/reset-password/${resetToken}`;
  const logoLink = `${config.FRONTEND_URL_PROD}/assets/logo.png`;
  

  const mailOptions = {
    from: config.email,
    to: userEmail,
    subject: 'Set Your Password',
    html: getSetPasswordEmailMarkup(setPasswordLink, firstName, logoLink),
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {    
    throw new Error('Failed to send email');
  }
}

async function sendAccountActivationEmail(req, userEmail, firstName, resetToken) {
  const setPasswordUrl = req?.get?.('host')?.includes('localhost')
                            ? config.FRONTEND_URL
                            : config.FRONTEND_URL_PROD;;
  const setPasswordLink = `${setPasswordUrl}/auth/reset-password/${resetToken}`;
  const logoLink = `${config.FRONTEND_URL_PROD}/assets/logo.png`;
  

  const mailOptions = {
    from: config.email,
    to: userEmail,
    subject: 'Set Your Password',
    html: getAccountActivatedEmailMarkup(setPasswordLink, firstName, logoLink),
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {    
    throw new Error('Failed to send email');
  }
}

// Helper function to generate the HTML email markup for setting the password
function getSetPasswordEmailMarkup(setPasswordLink, firstName, logoLink) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Set Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
        
        <!-- Header Section -->
        <div style="background: #77B634; padding: 20px; text-align: center;">
            <img src="https://res.cloudinary.com/dr8syainc/image/upload/v1742228014/logowhite_hfci38.png" alt="Itrack"
                 style="max-width: 250px; display: block; margin: 0 auto;">
        </div>

        <!-- Content Section -->
        <div style="padding: 20px; text-align: left; color: #333;">
            <h2 style="color: #333; margin-bottom: 10px;">Hello ${firstName},</h2>
            <p>You have been successfully onboarded to <strong>ITrack</strong>. To complete your setup, please click the link below to set your password:</p>
            
            <!-- Fixes Email Button Issues -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                    <td style="border-radius: 5px; background: #77B634;">
                        <a href="${setPasswordLink}"
                           style="display: inline-block; padding: 12px 20px; font-size: 16px;
                                  color: white; text-decoration: none; border-radius: 5px; background: #77B634;">
                            Set Password
                        </a>
                    </td>
                </tr>
            </table>
            
            <p>The link will expire in <strong>24 hours</strong>. If you did not request this, please ignore this email.</p>
            <p>Thank you,<br><strong>Itrack</strong></p>
        </div>

        <!-- Footer Section -->
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>&copy; 2025 Itrack. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}

function getAccountActivatedEmailMarkup(setPasswordLink, firstName, logoLink) {
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Set Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
        
        <!-- Header Section -->
        <div style="background: #77B634; padding: 20px; text-align: center;">
            <img src="https://res.cloudinary.com/dr8syainc/image/upload/v1742228014/logowhite_hfci38.png" alt="Itrack"
                 style="max-width: 250px; display: block; margin: 0 auto;">
        </div>

        <!-- Content Section -->
        <div style="padding: 20px; text-align: left; color: #333;">
            <h2 style="color: #333; margin-bottom: 10px;">Hello ${firstName},</h2>
            <p>Your account has been activated successfully. Please click the link below to set your password:</p>
            
            <!-- Fixes Email Button Issues -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                    <td style="border-radius: 5px; background: #77B634;">
                        <a href="${setPasswordLink}"
                           style="display: inline-block; padding: 12px 20px; font-size: 16px;
                                  color: white; text-decoration: none; border-radius: 5px; background: #77B634;">
                            Set Password
                        </a>
                    </td>
                </tr>
            </table>
            
            <p>The link will expire in <strong>24 hours</strong>. If you did not request this, please ignore this email.</p>
            <p>Thank you,<br><strong>Itrack</strong></p>
        </div>

        <!-- Footer Section -->
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>&copy; 2025 Itrack. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
}

const deleteUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });

  if (!user) {
    throw new Error('User not found.');
  }

  return prisma.user.delete({ where: { id: parseInt(id) } });
};

const getActiveUsers = (page = 1, limit = 10) => {
  return prisma.$transaction([
    prisma.user.findMany({
      where: { status: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        roleName: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({
      where: { status: true },
    }),
  ]);
};

const updateUserToAdmin = async (email, roleId) => {
  // Find the user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Update the user's status and role
  const updateUser = await prisma.user.update({
    where: { email },
    data: {
      status: true,
      roleId: Number(roleId),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      roleName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Send an email to the user
  const emailSubject = 'Your Account Has Been Updated';
  const emailText = `Hello ${updateUser.firstName},\n\nYou have been added as an Admin on Itrack. Click the invite link below to setup your password and login:\n\nLogin Link: ${config.FRONTEND_URL_PROD_PROD}\n\nBest regards,\nThe Team`;

  await sendEmail(updateUser.email, emailSubject, emailText);

  return updateUser;
};

const getUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email }, // Find the user by email
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      roleName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

const filterUsers = async (page = 1, limit = 10, roleName, keyword) => {
  const where = {};

  if (roleName) {
    where.roleName = roleName;
  }

  if (keyword) {
    where.OR = [
      { firstName: { contains: keyword, mode: 'insensitive' } },
      { lastName: { contains: keyword, mode: 'insensitive' } },
      { email: { contains: keyword, mode: 'insensitive' } },
    ];
  }

  return prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        roleName: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
};

export const toggleUserStatus = async (req) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found.');
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: !user.status },
    });
    
    if (updatedUser.status) {
      try {
        const generated_token = generatePasswordResetToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await password_resetService.createPasswordReset({
          userId: updatedUser.id,
          token: generated_token,
          status: false,
          expiresAt: expiresAt,
        });

        await sendAccountActivationEmail(
          req,
          updatedUser.email,
          updatedUser.firstName,
          generated_token,
        );
      } catch (error) {      
        throw new Error('Failed to send set password email');
      }
    }

    return updatedUser;
  } catch (err) {
    throw new Error("Unable to update user status") 
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  updateUserToAdmin,
  getActiveUsers,
  filterUsers,
  toggleUserStatus
};
