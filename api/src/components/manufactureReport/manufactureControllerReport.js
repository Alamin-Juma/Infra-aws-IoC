import reportService from './manufactureServiceReport.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


const getManufacturerInventory = async (req, res) => {
  try {
    const { manufacturer, status, condition, page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Build the where clause for filtering
    const where = {};

    if (manufacturer && manufacturer !== "All") {
      where.manufacturer = { name: manufacturer };
    }
    if (status && status !== "All") {
      where.deviceStatus = { name: status };
    }
    if (condition && condition !== "All") {
      where.deviceCondition = { name: condition };
    }

    // Fetch devices with pagination
    const devices = await prisma.device.findMany({
      where,
      include: {
        manufacturer: true,
        deviceType: true,
        deviceStatus: true,
        deviceCondition: true
      },
      skip, // Pagination: Offset
      take: limitNumber // Pagination: Limit
    });

    // Count total records (for pagination metadata)
    const totalCount = await prisma.device.count({ where });

    if (!devices.length) {
      return res.status(404).json({ message: "No inventory records found for the selected filters." });
    }

    // Process the fetched data (unchanged logic)
    const statuses = await prisma.deviceStatus.findMany();
    const availableStatus = statuses.find((s) => s.name === "Available");

    const reportData = devices.reduce((acc, device) => {
      const manufacturerName = device.manufacturer.name;
      const deviceTypeName = device.deviceType.name;

      if (!acc[manufacturerName]) {
        acc[manufacturerName] = {
          manufacturer: manufacturerName,
          deviceTypes: {},
          totalDevices: 0,
          assignedDevices: 0,
          availableDevices: 0,
          lostDevices: 0,
          brokenDevices: 0
        };
      }

      if (!acc[manufacturerName].deviceTypes[deviceTypeName]) {
        acc[manufacturerName].deviceTypes[deviceTypeName] = {
          name: deviceTypeName,
          total: 0,
          assigned: 0,
          available: 0,
          lost: 0,
          broken: 0
        };
      }

      const manufacturerData = acc[manufacturerName];
      const deviceTypeData = manufacturerData.deviceTypes[deviceTypeName];

      manufacturerData.totalDevices++;
      deviceTypeData.total++;

      if (device.assignedUser || device.deviceStatus.name === "Assigned") {
        manufacturerData.assignedDevices++;
        deviceTypeData.assigned++;
      } else if (device.deviceStatus.name === "Available" || (availableStatus && device.deviceStatusId === availableStatus.id)) {
        manufacturerData.availableDevices++;
        deviceTypeData.available++;
      }

      if (device.deviceCondition.name === "Lost") {
        manufacturerData.lostDevices++;
        deviceTypeData.lost++;
      } else if (device.deviceCondition.name === "Broken") {
        manufacturerData.brokenDevices++;
        deviceTypeData.broken++;
      }

      return acc;
    }, {});

    const formattedData = Object.values(reportData).map((manufacturer) => ({
      ...manufacturer,
      deviceTypes: Object.values(manufacturer.deviceTypes).map((deviceType) => ({
        ...deviceType,
        percentageBroken: deviceType.total > 0 ? Math.round((deviceType.broken / deviceType.total) * 100) : 0
      })),
      brokenPercentage: manufacturer.totalDevices > 0 ? Math.round((manufacturer.brokenDevices / manufacturer.totalDevices) * 100) : 0
    }));

    // Send paginated response
    res.json({
      data: formattedData,
      total: totalCount,
      page: pageNumber,
      limit: limitNumber
    });
  } catch (error) {
    res.status(500).json({ message: "Error generating report" });
  }
};



export const generatePdf = async (req, res) => {
  try {
    const { data, options } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    const pdfBuffer = await reportService.generatePdf(data, {
      logo: options?.logo || 'https://res.cloudinary.com/dr8syainc/image/upload/v1742228014/logowhite_hfci38.png',
      themeColor: options?.themeColor || '#77B634',
      title: options?.title || 'Custom Report',
      table: options?.format === 'table',
      landscape: options?.landscape,
      headers: options?.headers,
      footer: options?.footer,
      size: options?.size
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${options?.filename || 'report'}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};


export const downloadCsv = async (req, res) => {
  try {
    await reportService.generateCsv(req.body, res);
  } catch (error) {
    res.status(500).json({ message: "Error generating CSV", error });
  }
};



async function getReportData(manufacturer, status, condition) {
  const where = {};

  if (manufacturer && manufacturer !== 'All') {
    where.manufacturer = { name: manufacturer };
  }

  if (status && status !== 'All') {
    where.deviceStatus = { name: status };
  }

  if (condition && condition !== 'All') {
    where.deviceCondition = { name: condition };
  }

  const devices = await prisma.device.findMany({
    where,
    include: {
      manufacturer: true,
      deviceType: true,
      deviceStatus: true,
      deviceCondition: true
    }
  });

  const reportData = devices.reduce((acc, device) => {
    const manufacturerName = device.manufacturer.name;

    if (!acc[manufacturerName]) {
      acc[manufacturerName] = {
        manufacturer: manufacturerName,
        deviceTypes: {},
        totalDevices: 0,
        assignedDevices: 0,
        availableDevices: 0,
        lostDevices: 0,
        brokenDevices: 0
      };
    }

    acc[manufacturerName].totalDevices++;

    if (device.deviceStatus.name === 'Assigned') {
      acc[manufacturerName].assignedDevices++;
    } else if (device.deviceStatus.name === 'Available') {
      acc[manufacturerName].availableDevices++;
    }

    if (device.deviceCondition.name === 'Lost') {
      acc[manufacturerName].lostDevices++;
    } else if (device.deviceCondition.name === 'Broken') {
      acc[manufacturerName].brokenDevices++;
    }

    const deviceType = device.deviceType.name;
    if (!acc[manufacturerName].deviceTypes[deviceType]) {
      acc[manufacturerName].deviceTypes[deviceType] = 0;
    }
    acc[manufacturerName].deviceTypes[deviceType]++;

    return acc;
  }, {});

  return Object.values(reportData).map(item => ({
    ...item,
    deviceTypes: Object.entries(item.deviceTypes).map(([name, count]) => ({ name, count })),
    brokenPercentage: item.totalDevices > 0
      ? Math.round((item.brokenDevices / item.totalDevices) * 100)
      : 0
  }));
}

const ReportsController = {
  getManufacturerInventory,
  generatePdf,
  downloadCsv
};

export default ReportsController;

