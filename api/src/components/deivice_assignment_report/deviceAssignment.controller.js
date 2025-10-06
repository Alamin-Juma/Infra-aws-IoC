import assignmentService from "./deviceAssignmentReport.service.js";

const formatActivityData = (activities) => {


    return activities.map(activity => {
        const names = extractNamesFromDescription(activity.description) || {};


        return {
            deviceType: activity.device.deviceType.name,
            serialNumber: activity.device.serialNumber,
            manufacturer: activity.device.manufacturer.name,
            deviceStatus: activity.device.deviceStatus.name,
            performedBy: `${activity.user.firstName} ${activity.user.lastName}`,
            assignedUser: `${names.firstName} ${names.lastName}`,
            userEmail: activity.user.email,
            activityType: activity.activityType.name,
            activityDate: activity.createdAt,
            description: activity.description
        }
    });
};

export const getDeviceAssignments = async (req, res) => {
    try {
        const {
            activityType = '',
            deviceType = '',
            startDate,
            endDate,
            page = 1,
            limit = 10
        } = req.query;

        const {
            activities,
            totalCount,
            totalPages,
            currentPage
        } = await assignmentService.getDeviceAssignmentHistory({
            activityType,
            deviceType,
            startDate,
            endDate,
            page: Number(page),
            limit: Number(limit)
        });

        const formattedData = formatActivityData(activities);

        res.json({
            success: true,
            data: formattedData,
            totalCount,
            totalPages,
            currentPage,
            itemsPerPage: Number(limit),
            filters: {
                activityType: activityType || 'All activities',
                dateRange: startDate || endDate
                    ? `${startDate || 'Start'} to ${endDate || 'End'}`
                    : 'All dates'
            }

        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch device activities',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


const extractNamesFromDescription = (description) => {
    // Pattern for different activity description formats
    const patterns = [
        // Format: "Unassigned FirstName LastName on date at time"
        /^(Unassigned|Assigned to|Removed|Added)\s+([A-Z][a-z]+)(?:\s+([A-Z][a-z]+))?(?:\s+on|\s+at|\s+to|$)/i,
        // Format: "Changed status for FirstName LastName"
        /(?:for|by)\s+([A-Z][a-z]+)(?:\s+([A-Z][a-z]+))?$/i,
        // Fallback: Extract any two consecutive capitalized words
        /\b([A-Z][a-z]+)(?:\s+([A-Z][a-z]+))?\b/
    ];

    for (const pattern of patterns) {
        const match = description.match(pattern);
        if (match) {
            return {
                firstName: match[2] || match[1],
                lastName: match[3] || '' 
            };
        }
    }

    return null;
};

export const generatePdf = async (req, res) => {
    try {
      const { data, options } = req.body;
  
      if (!data) {
        return res.status(400).json({ error: 'Data is required' });
      }
  
      const pdfBuffer = await assignmentService.generatePdf(data, {
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
        await assignmentService.generateCsv(req.body, res);
    } catch (error) {
        res.status(500).json({ message: "Error generating CSV", error });
    }
};

export default {
    getDeviceAssignments,
    generatePdf,
    downloadCsv
};
