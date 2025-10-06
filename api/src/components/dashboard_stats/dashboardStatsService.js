import { PrismaClient } from "@prisma/client";
import { toSentenceCase } from "./sentenceCaseHelper.js";

const prisma = new PrismaClient();


const getDeviceStatistics = async () => {
  try {
    // Get device type counts
    const deviceTypes = await prisma.deviceType.findMany({
      select: {
        name: true,
        _count: {
          select: {
            devices: true,
          },
        },
      },
      where: {
        status: true,
      },
    });

    // Get device condition counts
    const deviceConditions = await prisma.deviceCondition.findMany({
      select: {
        name: true,
        _count: {
          select: {
            devices: true,
          },
        },
      },
      where: {
        status: true,
      },
    });

    return {
      deviceTypeCounts: deviceTypes.map((type) => ({
        name: toSentenceCase(type.name),
        value: type._count.devices,
      })),
      conditionCounts: deviceConditions.map((condition) => ({
        name: toSentenceCase(condition.name),
        value: condition._count.devices,
      })),
    };
  } catch (error) {
    throw error;
  }
};


const getMonthlyRequestCounts = async () => {
  try {
    const currentYear = new Date().getFullYear();

    // Query to get monthly counts for the current year
    const monthlyCounts = await prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "createdAt") as month,
        COUNT(*)::integer as count
      FROM "ExternalRequest"
      WHERE EXTRACT(YEAR FROM "createdAt") = ${currentYear}
      GROUP BY EXTRACT(MONTH FROM "createdAt")
      ORDER BY month
    `;

    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    const result = monthNames.map((name, index) => {
      const monthNumber = index + 1;

      // Find matching month data
      const monthData = monthlyCounts.find(m => {
        // Convert month to number regardless of original type
        const dbMonth = Number(m.month);
        return dbMonth === monthNumber;
      });

      return {
        name,
        value: monthData ? Number(monthData.count) : 0
      };
    });

    return result;

  } catch (error) {
    throw error;
  }
};

//Using raw query here for better performance
const getDevicesConditionAndStatusCounts = async () => {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        dt.name as "deviceType",
        dc.name as "condition",
        ds.name as "status",
        COUNT(d.id) as "count"
      FROM "DeviceType" dt
      JOIN "Device" d ON d."deviceTypeId" = dt.id
      JOIN "DeviceCondition" dc ON d."deviceConditionId" = dc.id
      JOIN "DeviceStatus" ds ON d."deviceStatusId" = ds.id
      WHERE dt.status = true
      GROUP BY dt.name, dc.name, ds.name
      ORDER BY dt.name, dc.name, ds.name
    `;

    // Function to convert a string to sentence case
    const toSentenceCase = (str) => {
      if (!str) return str;
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Transform the raw results
    const transformed = result.reduce((acc, row) => {
      const deviceTypeSentenceCase = toSentenceCase(row.deviceType);
      const existingType = acc.find(item => item.deviceType === deviceTypeSentenceCase);
      const count = Number(row.count);

      if (existingType) {
        // Update condition counts
        existingType.conditions[row.condition] =
          (existingType.conditions[row.condition] || 0) + count;

        // Update status counts
        existingType.statuses[row.status] =
          (existingType.statuses[row.status] || 0) + count;

        existingType.totalDevices += count;
      } else {
        acc.push({
          deviceType: deviceTypeSentenceCase,
          totalDevices: count,
          conditions: { [row.condition]: count },
          statuses: { [row.status]: count }
        });
      }
      return acc;
    }, []);

    return transformed;
  } catch (error) {
    throw error;
  }
};

export default {
  getDeviceStatistics,
  getMonthlyRequestCounts,
  getDevicesConditionAndStatusCounts
};
