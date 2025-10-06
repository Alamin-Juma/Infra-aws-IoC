import { PrismaClient } from '@prisma/client';
import { generatePDF, generateCSV } from './exportHelper.js';

const prisma = new PrismaClient();

const getDeviceHistory = async ({ from, to, serialNumber, deviceTypeId }) => {
  // Default date range (last 30 days to today)
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 30);
  
  const fromDate = from ? new Date(from) : defaultFrom;
  const toDate = to ? new Date(to) : new Date();

  const whereClause = {
    createdAt: {
      gte: fromDate,
      lte: toDate
    }
  };

  if (serialNumber) {
    whereClause.device = {
      serialNumber
    };
  }

  if (deviceTypeId) {
    whereClause.device = {
      ...whereClause.device,
      deviceTypeId: parseInt(deviceTypeId)
    };
  }

  return await prisma.deviceActivity.findMany({
    where: whereClause,
    include: {
      device: {
        select: {
          serialNumber: true,
          deviceType: {
            select: {
              name: true
            }
          }
        }
      },
      user: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      activityType: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const exportDeviceHistory = async ({ from, to, serialNumber, deviceTypeId, format }) => {
  const data = await getDeviceHistory({ from, to, serialNumber, deviceTypeId });
  
  const formattedData = data.map(item => ({
    'Serial Number': item.device.serialNumber,
    'deviceType': item.device.deviceType,
    'Action': item.activityType.name,
    'Notes': item.description || 'N/A',
    'Performed By': `${item.user.firstName} ${item.user.lastName}`,
    'Date': format(item.createdAt, 'yyyy-MM-dd HH:mm:ss')
  }));

  if (format === 'csv') {
    return generateCSV(formattedData);
  } else if (format === 'pdf') {
    return await generatePDF({
      title: 'Device History Report',
      headers: ['Serial Number','deviceType', 'Action', 'Notes', 'Performed By', 'Date'],
      data: formattedData.map(item => Object.values(item))
    });
  }

  return formattedData;
};

export default {
  getDeviceHistory,
  exportDeviceHistory
};

