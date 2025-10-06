import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import config from '../../configs/app.config.js';
import puppeteer from 'puppeteer';
import PDFDocument from 'pdfkit';
import { PurchaseOrderStatus } from '../../constants/status.constants.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '../../constants/table.constants.js';
import { COMPANY_DETAILS } from '../../constants/general.constants.js';
import { AppError } from '../../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.resolve(__dirname, '../assets/logo.png');
const logoBase64 = fs.readFileSync(logoPath, 'base64');
const logoSrc = `data:image/png;base64,${logoBase64}`;

const doc = new PDFDocument();
const prisma = new PrismaClient();

let browser;

const getBrowser = async () => {
  if (!browser) {
    const executablePath =
      process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium';

    browser = await puppeteer.launch({
      executablePath,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ],
    });
  }
  return browser;
};
const getAllPurchaseOrders = (
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  keyword,
  status,
) => {
  const where = {
    ...(keyword && {
      poNumber: {
        contains: keyword,
        mode: 'insensitive',
      },
    }),
    ...(status && { status }),
  };

  return prisma.$transaction([
    prisma.purchaseOrder.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        poNumber: true,
        vendor: {
          select: {
            id: true,
            name: true,
          },
        },
        createdByUserId: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      where,
    }),
    prisma.purchaseOrder.count(),
  ]);
};

const getPurchaseOrderById = async (id) => {
  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: Number(id) },
      select: {
        poNumber: true,
        createdAt: true,
        status: true,
        vendor: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            physicalAddress: true,
          },
        },
        items: {
          select: {
            deviceType: {
              select: {
                id: true,
                name: true,
              },
            },
            specification: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            expectedDeliveryDate: true,
          },
        },
        status: true,
        totalAmount: true,
      },
    });

    if (!purchaseOrder) {
      throw new Error('Purchase order not found');
    }

    return purchaseOrder;
  } catch (error) {
    throw new Error('Failed to fetch purchase order');
  }
};

const sendEmailToVendor = async (poNumber, existingPurchaseOrder) => {
  try {
    const generateHTML = () => {
      const itemsHTML = existingPurchaseOrder.items
        .map(
          (item) => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; text-transform: capitalize;">${
              item.deviceType.name
            }</td>
            <td style="padding: 12px; word-break: break-word;">${
              item.specification
            }</td>
            <td style="padding: 12px;">${item.quantity}</td>
            <td style="padding: 12px;">${item.unitPrice.toLocaleString({
              minimumFractionDigits: 2,
            })}</td>
            <td style="padding: 12px;"> ${item.totalPrice.toLocaleString({
              minimumFractionDigits: 2,
            })}</td>
          </tr>
        `,
        )
        .join('');

      return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              background-color: #ffffff;
              color: #1f2937;
            }
            .border-left{
            border-left: 1px solid #e5e7eb;
              }
            .padding-left{
            padding-left: 20px;
            }
            .card {
              background-color: #ffffff;
              padding: 24px;
              margin-bottom: 24px;
            }
            h1 {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .text-sm { font-size: 14px; }
            .text-gray { color: #6b7280; }
            .font-bold { font-weight: bold; }
            .flex { display: flex; justify-content: space-between; }
            .section {
              border-top: 1px solid #e5e7eb;
              border-bottom: 1px solid #e5e7eb;
              padding-top: 16px;
              padding-bottom: 16px;
              margin-top: 20px;
              margin-bottom: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              table-layout: auto;
            }
            th {
              background-color: #f3f4f6;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
            }
            td {
              font-size: 14px;
              color: #111827;
            }
            .total {
              text-align: right;
              font-weight: bold;
              font-size: 16px;
              margin-top: 20px;
              padding-top: 12px;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="flex">
              <div>
                <h1>Purchase Order</h1>
                <p class="text-gray text-sm">#${poNumber}</p>
              </div>
              <div>
                <img src="${logoSrc}" alt="Logo" style="height: 50px;" />
              </div>
            </div>

            <div class="section flex">
              <div>
                <p><strong>Issued:</strong><br/>
                  ${new Date(
                    existingPurchaseOrder.createdAt,
                  ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </p>
                <p><strong>Due:</strong><br/>
                  ${new Date(
                    existingPurchaseOrder.items[0].expectedDeliveryDate,
                  ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </p>
              </div>
              <div class="border-left padding-left">
                <p><strong>To:</strong></p>
                <p>${existingPurchaseOrder.vendor.name}</br>
                ${existingPurchaseOrder.vendor.physicalAddress || 'N/A'}</p>
              </div>
              <div class="border-left padding-left">
                <p><strong>From:</strong></p>
                <p> ${COMPANY_DETAILS.COMPANY_NAME}</br>
                ${COMPANY_DETAILS.COMPANY_ADDRESS}</br>
                ${COMPANY_DETAILS.COMPANY_TELEPHONE}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Device Type</th>
                  <th>Specification</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Line Total </th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML}
              </tbody>
            </table>

            <p class="total">Total: KES ${existingPurchaseOrder.totalAmount.toLocaleString(
              {
                minimumFractionDigits: 2,
              },
            )}</p>
          </div>
        </body>
      </html>
    `;
    };

    const generatePDFBuffer = async () => {
      const browserInstance = await getBrowser();
      const page = await browserInstance.newPage();
      await page.setContent(generateHTML(), { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await page.close();
      return pdfBuffer;
    };

    const pdfBuffer = await generatePDFBuffer();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: config.email,
        pass: config.app_password,
      },
    });

    const mailOptions = {
      from: config.email,
      to: `${existingPurchaseOrder.vendor.email}`,
      subject: `Purchase Order ${poNumber}`,
      text: `Hello ${existingPurchaseOrder.vendor.name},\n\n Here is our purchase order (${poNumber}). Please review the details and proceed accordingly.\n\nThank you,\nThe Jitu`,
      html: `
        <p>Hello ${existingPurchaseOrder.vendor.name},</p>
        <p>Here is our purchase order (<strong>${poNumber}</strong>). Please review the details and proceed accordingly.</p>
        <p>Thank you,<br>The Jitu</p>
      `,
      attachments: [
        {
          filename: `purchase_order_${poNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new AppError(
      'SERVER_ERROR',
      'Unable to send purchase order to the vendor',
    );
  }
};

const updatePurchaseOrderStatus = async (id, status, lastUpdatedById) => {
  const validStatuses = Object.values(PurchaseOrderStatus);
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const existingPurchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id: Number(id) },
    select: {
      poNumber: true,
      createdAt: true,
      vendor: true,
      items: {
        select: {
          deviceType: {
            select: {
              id: true,
              name: true,
            },
          },
          specification: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          expectedDeliveryDate: true,
        },
      },
      status: true,
      totalAmount: true,
    },
  });

  if (!existingPurchaseOrder) {
    throw new Error('Purchase order not found.');
  }

  if (status === PurchaseOrderStatus.POSent) {
    try {
      await sendEmailToVendor(
        existingPurchaseOrder.poNumber,
        existingPurchaseOrder,
      );
    } catch (error) {
      throw new AppError(
        'SERVER_ERROR',
        'Error sending purchase order to the vendor',
      );
    }
  }

  const updatedPurchaseOrder = await prisma.purchaseOrder.update({
    where: { id: Number(id) },
    data: {
      status: status,
    },
  });

  if (!updatedPurchaseOrder) {
    throw new Error('Failed to update purchase order status.');
  }

  return updatedPurchaseOrder;
};

export default {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrderStatus,
};
