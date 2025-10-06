import { PrismaClient } from '@prisma/client';
import config from '../../configs/app.config.js';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email,
    pass: config.app_password,
  },
});

const sendEmail = async (to, subject, html) => {
  if (!config.email || !config.app_password) {
    throw new Error('Email configuration is missing. Please check your environment variables.');
  }

  const mailOptions = {
    from: config.email,
    to,
    subject,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};


const assignDevice = async (id, data) => {

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: data.userEmail },
    });

    if (!user) {
      throw new Error('User not found');
    }


    const deviceStatus = await prisma.deviceStatus.findFirst({
      where: { name: 'assigned' },
    });

    // Update the device status to "assigned" (statusId = 1)
    const updatedDevice = await prisma.device.update({
      where: { id: parseInt(id) },
      data: {
        deviceStatusId: deviceStatus.id,
        assignedUser: data.userEmail,
      },
      include: {
        deviceType: true,
        deviceCondition:true
      }
    });

    if (updatedDevice.deviceCondition.name !== 'Good') {
      return{
        status:false,
        message:'You cannot assign a device to a user if its condition is not good.'
      }
    }

    const today = new Date();
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const seconds = today.getSeconds()
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    let deviceActivity = await prisma.activityType.findFirst({
      where: { name: 'device_assignment' },
    });

    if (!deviceActivity) {
      deviceActivity = await prisma.activityType.create({
        data: {
          name: 'device_assignment'
        }
      });
    }
    
    const activity = await prisma.deviceActivity.create({
      data: {
        deviceId: parseInt(id),
        performedBy:  parseInt(data.performedBy),
        activityTypeId: deviceActivity.id,
        description: `Assigned to ${user.firstName} ${user.lastName} on ${formattedDate} at ${formattedTime}`,
        deviceStatusId: deviceStatus.id,
      },
    });

    
    const subject = 'Device Assigned to You';
    const htmlInfo = `
      <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Device Assignment Notification</title>
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
            <h2 style="color: #333; margin-bottom: 10px;">Hello ${user.firstName},</h2>
            <p>You have been assigned a device with the following details:</p>
            
        <ul>
          <li>Device Type: ${updatedDevice.deviceType.name}</li>
          <li>Serial Number: ${updatedDevice.serialNumber}</li>
          <li>Assigned Date: ${new Date(updatedDevice.updatedAt).toLocaleString()} </li>
        </ul>
        <p>Please ensure that you acknowledge receipt of this device and adhere to the organization's device usage policy.</p>
        <p>If you have any questions or require any assistance, feel free to reach out to IT Support at <a href="mailto:itrack918@gmail.com">itrack918@gmail.com</a>.</p>
       
        <!-- Footer Section -->
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>&copy; 2025 Itrack. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `;

    await sendEmail(user.email, subject, htmlInfo);

    
    return { device: updatedDevice, activity };
  } catch (error) {
    
    if (error.message === 'User not found' || error.message === 'Failed to send email') {
      throw error;
    }
    
    throw new Error('Failed to assign device', error);
  }
};

const unassignDevice = async (id, performedBy) => {
  try {
    const device = await prisma.device.findUnique({
      where: { id: parseInt(id) },
      include: {
        deviceType: true
      }
    });

    if (!device) {
      throw new Error('Device not found');
    }

    if (!device.assignedUser) {
      throw new Error('Device is not assigned to any user');
    }

    const user = await prisma.user.findUnique({
      where: { email: device.assignedUser }
    });

    if (!user) {
      throw new Error('Assigned user not found');
    }

    const deviceStatus = await prisma.deviceStatus.findFirst({
      where: { name: 'available' }
    });

    if (!deviceStatus) {
      throw new Error('Available status not found');
    }

    let deviceActivity = await prisma.activityType.findFirst({
      where: { name: 'device_unassignment' }
    });

    if (!deviceActivity) {
      deviceActivity = await prisma.activityType.create({
        data: {
          name: 'device_unassignment'
        }
      });
    }

    const updatedDevice = await prisma.device.update({
      where: { id: parseInt(id) },
      data: {
        deviceStatusId: deviceStatus.id,
        assignedUser: null
      },
      include: {
        deviceType: true
      }
    });

    const now = new Date();
    const formattedTime = now.toLocaleTimeString();
    const formattedDate = now.toISOString().split('T')[0];

    const activity = await prisma.deviceActivity.create({
      data: {
        deviceId: parseInt(id),
        performedBy: Number(performedBy),
        activityTypeId: deviceActivity.id,
        description: `Unassigned ${user.firstName} ${user.lastName} on ${formattedDate} at ${formattedTime}`,
        deviceStatusId: deviceStatus.id
      }
    });

    const subject = `Device Unassigned: ${updatedDevice.deviceType.name}`;
    const htmlInfo = `
      <!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Device Unassignment Notification</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
        
        <div style="background: #77B634; padding: 20px; text-align: center;">
            <img src="https://res.cloudinary.com/dr8syainc/image/upload/v1742228014/logowhite_hfci38.png" alt="Itrack"
                 style="max-width: 250px; display: block; margin: 0 auto;">
        </div>

        <div style="padding: 20px; text-align: left; color: #333;">
            <h2 style="color: #333; margin-bottom: 10px;">Hello ${user.firstName},</h2>
            <p>The ${updatedDevice.deviceType.name} with serial number: (${device.serialNumber}) previously assigned to you has been unassigned. </p>
       
        <p>For any inquiries, please contact IT Support at <a href="mailto:itrack918@gmail.com">itrack918@gmail.com</a>.</p>
        <br /> <br />

        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>&copy; 2025 Itrack. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
      `;

    await sendEmail(user.email, subject, htmlInfo);

    return { device: updatedDevice, activity };
  } catch (error) {
    if (error.message === 'Device not found' ||
        error.message === 'Device is not assigned to any user' ||
        error.message === 'Assigned user not found' ||
        error.message === 'Available status not found' ||
        error.message === 'Failed to send email') {
      throw error;
    }
    
    throw new Error('Failed to unassign device');
  }
};


export default {
  assignDevice,
  unassignDevice
};
