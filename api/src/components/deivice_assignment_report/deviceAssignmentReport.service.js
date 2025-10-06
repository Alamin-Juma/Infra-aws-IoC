import { PrismaClient } from "@prisma/client";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import axios from 'axios';
import { format } from "fast-csv";


const prisma = new PrismaClient();

const getDeviceAssignmentHistory = async ({
    activityType = '',
    deviceType = '',
    startDate,
    endDate,
    page = 1,
    limit = 10
}) => {
    const whereClause = {};

    // Add activity type filter only if specified
    if (activityType) {
        whereClause.activityType = {
            name: activityType
        };
    }

    // Add device type filter if specified
    if (deviceType) {
        whereClause.device = {
            deviceType: {
                name: deviceType
            }
        };
    }

    // Add date range filter if provided
    if (startDate || endDate) {
        whereClause.createdAt = {};
        if (startDate) whereClause.createdAt.gte = new Date(startDate);
        if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const [activities, totalCount] = await Promise.all([
        prisma.deviceActivity.findMany({
            where: whereClause,
            include: {
                device: {
                    include: {
                        deviceType: true,
                        manufacturer: true,
                        deviceStatus: true
                    }
                },
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                activityType: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip: (page - 1) * limit,
            take: limit
        }),
        prisma.deviceActivity.count({
            where: whereClause
        })
    ]);

    return {
        activities,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
    };
};

const generatePdf = async (data, options = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Validate and limit data size
            if (Array.isArray(data) && data.length > 5000) {
                data = data.slice(0, 5000);
            }

            // Default options with safe limits
            const defaultOptions = {
                size: 'A4',
                margin: 50,
                landscape: true,
                themeColor: '#77B634',
                title: 'Report',
                footer: '© Your Company Name',
                table: false,
                headers: data.length > 0 ? Object.keys(data[0]) : [],
                maxRows: 5000,
                footerMargin: 20,
                chunkSize: 100,
                minRowHeight: 20, // Minimum row height
                maxTextHeight: 100, // Maximum height for text in a cell
                wrapText: true // Enable text wrapping
            };

            options = { ...defaultOptions, ...options };

            const doc = new PDFDocument({
                size: options.size,
                margin: options.margin,
                layout: options.landscape ? 'landscape' : 'portrait',
                bufferPages: true
            });

            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // Page dimensions
            const pageWidth = doc.page.width;
            const pageHeight = doc.page.height;
            const contentWidth = pageWidth - (options.margin * 2);
            const headerHeight = 122;
            const footerHeight = 30;
            const contentEndY = pageHeight - options.margin - footerHeight;

            // Improved footer function with bounds checking
            const addFooter = () => {
                const footerY = Math.min(
                    doc.page.height - options.margin - options.footerMargin,
                    doc.page.height - 20 // Ensure minimum margin
                );

                doc.moveTo(options.margin, footerY - 5)
                    .lineTo(pageWidth - options.margin, footerY - 5)
                    .lineWidth(0.8)
                    .strokeColor(options.themeColor)
                    .stroke();

                doc.fontSize(9)
                    .fillColor(options.themeColor)
                    .text(options.footer, options.margin, footerY, {
                        width: contentWidth,
                        align: 'center',
                        lineBreak: false // Prevent footer text from wrapping
                    });
            };

            doc.on('pageAdded', addFooter);

            // Add logo with error handling
            if (options.logo) {
                    let logoBuffer;
                    if (options.logo.startsWith('http')) {
                        const response = await axios.get(options.logo, {
                            responseType: 'arraybuffer',
                            maxContentLength: 2 * 1024 * 1024
                        });
                        logoBuffer = Buffer.from(response.data, 'binary');
                    } else {
                        logoBuffer = fs.readFileSync(options.logo);
                    }

                    doc.image(logoBuffer, options.margin, options.margin, {
                        width: options.logoWidth || 100,
                        height: options.logoHeight || undefined,
                        fit: [options.logoWidth || 100, options.logoHeight || 100]
                    });
        
            }

            // Add header with proper spacing
            const titleY = headerHeight - 30;
            const dateY = titleY + 25; 
            const lineY = dateY + 15; 
            const contentStartY = lineY + 15;

            // Add header
            doc.fillColor(options.themeColor)
                .fontSize(20)
                .font('Helvetica-Bold')
                .text(options.title, options.margin, titleY, {
                    width: contentWidth,
                    align: options.logo ? 'center' : 'left',
                    lineBreak: false
                });


            // Add generation date
            doc.fillColor(options.themeColor)
                .opacity(0.8)
                .fontSize(10)
                .text(`Generated: ${new Date().toLocaleString()}`, options.margin, dateY, {
                    width: contentWidth,
                    align: 'right',
                    lineBreak: false
                })
                .opacity(1.0);

            // Add horizontal line
            doc.moveTo(options.margin, lineY)
                .lineTo(pageWidth - options.margin, lineY)
                .lineWidth(1.5)
                .strokeColor(options.themeColor)
                .stroke();

             

            // Add content
            if (options.table && data.length > 0) {
                await drawTable(doc, data, options, contentStartY, contentEndY, contentWidth);
            } else {
                const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
                doc.fontSize(12)
                    .fillColor('#333333')
                    .text(content, options.margin, contentStartY, {
                        width: contentWidth,
                        align: 'left',
                        columns: 1,
                        height: contentEndY - contentStartY,
                        ellipsis: true
                    });
            }

            addFooter();
            doc.end();
        } catch (err) {
            reject(new Error('Failed to generate PDF. Please try with smaller data or different options.'));
        }
    });
};

async function drawTable(doc, data, options, startY, endY, contentWidth) {
    const headers = options.headers.map(h => h.header || h);
    const headerHeight = 30;
    const cellPadding = 5;
    const maxColWidth = contentWidth / headers.length;
    const minRowHeight = options.minRowHeight;
    const maxTextHeight = options.maxTextHeight;

    let currentY = startY;

    // Draw header
    doc.fillColor(options.themeColor)
        .rect(options.margin, currentY, contentWidth, headerHeight)
        .fill()
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(12);

    let xPos = options.margin;
    headers.forEach(header => {
        doc.text(header, xPos + cellPadding, currentY + cellPadding, {
            width: maxColWidth - (cellPadding * 2),
            height: headerHeight - (cellPadding * 2),
            align: 'left',
            lineBreak: false
        });
        xPos += maxColWidth;
    });

    currentY += headerHeight;

    // Process data in chunks
    for (let i = 0; i < data.length; i += options.chunkSize) {
        const chunk = data.slice(i, i + options.chunkSize);

        for (const row of chunk) {
            // Calculate required row height based on content
            let rowHeight = minRowHeight;
            xPos = options.margin;

            // First pass to calculate required height
            if (options.wrapText) {
                const textHeights = [];
                options.headers.forEach(({ key }) => {
                    const text = String(row[key] || '');
                    const height = doc.heightOfString(text, {
                        width: maxColWidth - (cellPadding * 2),
                        ellipsis: '...'
                    });
                    textHeights.push(height);
                });
                rowHeight = Math.max(minRowHeight, ...textHeights);
                rowHeight = Math.min(rowHeight, maxTextHeight);
            }

            // Check for page break
            if (currentY + rowHeight > endY) {
                doc.addPage();
                currentY = options.margin;
                // Redraw header on new page
                doc.fillColor(options.themeColor)
                    .rect(options.margin, currentY, contentWidth, headerHeight)
                    .fill()
                    .fillColor('#ffffff')
                    .font('Helvetica-Bold')
                    .fontSize(12);

                xPos = options.margin;
                headers.forEach(header => {
                    doc.text(header, xPos + cellPadding, currentY + cellPadding, {
                        width: maxColWidth - (cellPadding * 2),
                        height: headerHeight - (cellPadding * 2),
                        align: 'left',
                        lineBreak: false
                    });
                    xPos += maxColWidth;
                });

                currentY += headerHeight;
            }

            // Draw row background
            const rowColor = i % 2 === 0 ? '#f8fcf5' : '#ffffff';
            doc.fillColor(rowColor)
                .rect(options.margin, currentY, contentWidth, rowHeight)
                .fill()
                .fillColor('#333333')
                .font('Helvetica')
                .fontSize(10);

            // Draw cell content
            xPos = options.margin;
            options.headers.forEach(({ key }) => {
                const text = String(row[key] || '');
                doc.text(text, xPos + cellPadding, currentY + cellPadding, {
                    width: maxColWidth - (cellPadding * 2),
                    height: rowHeight - (cellPadding * 2),
                    align: 'left',
                    ellipsis: '...',
                    columns: 1
                });
                xPos += maxColWidth;
            });

            // Add subtle border
            doc.moveTo(options.margin, currentY + rowHeight)
                .lineTo(options.margin + contentWidth, currentY + rowHeight)
                .lineWidth(0.3)
                .strokeColor(options.themeColor)
                .opacity(0.3)
                .stroke()
                .opacity(1.0);

            currentY += rowHeight;
        }

        // Prevent call stack buildup
        await new Promise(resolve => setImmediate(resolve));
    }

    return currentY;
}


const generateCsv = async (data, res) => {
    res.setHeader("Content-Disposition", "attachment; filename=devices.csv");
    res.setHeader("Content-Type", "text/csv");

    const csvStream = format({ headers: data.headers.map(h => h.label), delimiter: "," });
    csvStream.pipe(res);

    data.data.forEach((row) => {
        csvStream.write(data.headers.map(h => row[h.key] || ""));
    });

    csvStream.end();
};


export default {
    getDeviceAssignmentHistory,
    generatePdf,
    generateCsv
};
