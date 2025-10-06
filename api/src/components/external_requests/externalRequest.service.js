import { PrismaClient } from '@prisma/client';
import generateTicketId from './generateTicketId.js';
import config from '../../configs/app.config.js';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import { getOnboardingCompletedAdminEmail} from '../../emails/onboardingEmail.js';
import { AppError } from '../../middleware/errorHandler.js';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email,
    pass: config.app_password,
  },
});

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: config.email,
    to,
    subject,
    html
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new AppError(500, 'Failed to send email');
  }
};

const sendEmailToMultipleUsers = async (recipients, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: config.email,
      to: recipients.join(', '),
      subject: subject,
      html: htmlContent,
    };
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new AppError(500, 'Failed to send email to multiple users');
  }
};

const recipients = await prisma.user.findMany({
  where: {
    roleName: {
      in: ['admin'],
    },
  },
  select: {
    email: true,
    firstName: true,
    lastName: true
  },
});

const template = handlebars.compile(`
<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>New Request on ITrack</title>
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
                <h3 style="color: #333; margin-bottom: 10px;">Hello {{fname}} {{lname}},</h3>
                <p>A new request has been submitted by <strong>{{senderFname}} {{senderLname}}</strong> on ITrack:</p>

           {{#if isOnboarding}}
           <div style="margin-bottom: 10px;">
             <div><strong>Devices:</strong> {{onboardingDevices}}</div>
             <div style="margin-top: 8px;">
               {{#each onboardingUsers}}
                 <div>{{this.name}} – {{this.email}}</div>
               {{/each}}
             </div>
           </div>
           {{#if navigationLink}}
           <div style="margin-top: 20px;">
             <a href="{{navigationLink}}" style="background: #77B634; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
               View Request in ITrack
             </a>
           </div>
           {{/if}}
           {{else}}
           <ul>
          <li>Request Type: {{request}}</li>
          <li>Device: {{deviceType}}</li>
          <li>Description: {{description}}</li>
        </ul>
           {{/if}}
                
            <p>Best regards,</p>
             <p>ITrack Team</p>
            </div>
    
            <!-- Footer Section -->
            <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                <p>&copy; 2025 Itrack. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
`);

const getRequestApprovedTemplate = handlebars.compile(
  `
    <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Approved Request on ITrack</title>
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
                  <h3 style="color: #333; margin-bottom: 10px;">Hello {{fname}} {{lname}},</h3>
                  <p>A new request has been approved by <strong>{{senderFname}} {{senderLname}}</strong> on ITrack:</p>

            {{#if navigationLink}}
            <div style="margin-top: 20px;">
              <a href="{{navigationLink}}" style="background: #77B634; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
                View Request in ITrack
              </a>
            </div>
            {{/if}}

            <ul>
                <li>Request Type: {{requestType}}</li>
                <li>Description: {{description}}</li>
            </ul>
                  
            <p>Best regards,</p>
            <p>ITrack Team</p>
            </div>
    
            <!-- Footer Section -->
            <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                <p>&copy; 2025 Itrack. All rights reserved.</p>
            </div>
          </div>
      </body>
      </html>
    `
);

const getUserRequestRejectedTemplate = handlebars.compile(
  `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Rejected Request on ITrack</title>
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
                <h3 style="color: #333; margin-bottom: 10px;">Hello {{fname}} {{lname}},</h3>
                <p>Your request on ITrack has been rejected.</p>
            <ul>
                <li>Request Type: {{requestType}}</li>
                <li>Description: {{description}}</li>
                <li>Reason For Rejection: {{reason}}</li>
            </ul>
                
            <p>Best regards,</p>
             <p>ITrack Team</p>
            </div>
    
            <!-- Footer Section -->
            <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                <p>&copy; 2025 Itrack. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `
);


const getAcknowledgmentEmailTemplate = ({ requesterName, ticketId }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>New Request on ITrack</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
          
          <!-- Header Section -->
          <div style="background: #77B634; padding: 20px; text-align: center;">
            <img src="https://res.cloudinary.com/dr8syainc/image/upload/v1742228014/logowhite_hfci38.png" alt="Itrack"
                    style="max-width: 250px; display: block; margin: 0 auto;">
          </div>

          <div style="background: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 10px 0;">Hello <strong>${requesterName}</strong>,</p>
            <p style="margin: 10px 0;">We have received your request and it is now being processed:</p>
            
            <div style="margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Ticket ID:</strong> ${ticketId}</p>
            </div>

            <p style="margin: 10px 0;">Our IT team will review your request and provide updates via email.</p>
          </div>

          <!-- Footer Section -->
          <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} iTrack. All rights reserved.</p>
              <p style="margin: 5px 0;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const getSimpleAcknowledgmentEmail = ({ requesterName, ticketId, description }) => {
  const formatDescription = (desc) => {
    if (!desc) return '';
    const lines = desc.split('\n').map(l => l.trim()).filter(Boolean);
    let formattedDesc = '';
    
    if (lines.length > 0) {
      formattedDesc += `<p><strong>Devices:</strong> ${lines[0]}</p>`;
      if (lines.length > 1) {
        formattedDesc += '<p><strong>Users:</strong></p><ul>';
        lines.slice(1).forEach(line => {
          const [name, email] = line.split('–').map(s => s.trim());
          formattedDesc += `<li>${name} - ${email}</li>`;
        });
        formattedDesc += '</ul>';
      }
    }
    return formattedDesc;
  };

  return `
   <!DOCTYPE html>
    <html>
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>New Request on ITrack</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
            
            <!-- Header Section -->
            <div style="background: #77B634; padding: 20px; text-align: center;">
              <img src="https://res.cloudinary.com/dr8syainc/image/upload/v1742228014/logowhite_hfci38.png" alt="Itrack"
                      style="max-width: 250px; display: block; margin: 0 auto;">
            </div>

            <!-- Main Content Card -->
            <div style="background: #ffffff; padding: 20px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="margin: 10px 0;">Hello <strong>${requesterName}</strong>,</p>
              <p style="margin: 10px 0;">We have received your request and it is now being processed:</p>

              <div style="margin: 20px 0;">
                <p style="margin: 10px 0;"><strong>Ticket ID:</strong> ${ticketId}</p>
                <div style="margin-top: 10px;">
                  ${formatDescription(description)}
                </div>
              </div>

              <p style="margin: 10px 0;">Our IT team will review your request and provide updates via email.</p>

              <div style="margin-top: 30px;">
                <p style="margin: 5px 0;">Best regards,</p>
                <p style="margin: 5px 0;"><strong>iTrack</strong></p>
              </div>
            </div>

            <!-- Footer Section -->
            <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
              <p style="margin: 5px 0;">© ${new Date().getFullYear()} iTrack. All rights reserved.</p>
              <p style="margin: 5px 0;">This is an automated message, please do not reply.</p>
            </div>
        </div>
      </body>
    </html>
  `;
};

const submitExternalRequest = async (req, email, requestType, deviceType, deviceTypes, description) => {
  try {
    if (!email || !requestType || !description) {
      throw new AppError(400, 'Missing required fields: email, requestType, and description are required');
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roleName: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'Your email is not recognized in our system. Please contact IT support at itrack918@gmail.com for assistance.');
    }

    const reqType = await prisma.requestType.findFirst({
      where: {
        id: Number(requestType)
      }
    });

    if (!reqType) {
      throw new AppError(400, 'Invalid request type. Please select a valid request type and try again.');
    }

    
    if (reqType.name.toLowerCase() === 'onboarding') {
      try {
        const ticketId = generateTicketId();
        
        const externalRequest = await prisma.externalRequest.create({
          data: {
            email,
            descriptions: description,
            requestTypeId: Number(requestType),
            deviceTypeId: null,
            externalRequestDeviceTypes: {
              create: deviceTypes.map((device) => ({
                deviceType: { connect: { id: device.deviceTypeId } },
                quantity: device.quantity
              })),
            },
            deviceId: null,
            userId: user.id
          },
          include: {
            user: true,
            device: false
          },
        });

        
        const ticketTrail = await prisma.ticketTrail.create({
          data: {
            ticketId,
            narration: description,
            externalRequest: {
              connect: { id: externalRequest.id }
            }
          }
        });

        
        for (const receiver of recipients) {
          const htmlContent = template({ 
            fname: receiver.firstName, 
            lname: receiver.lastName, 
            deviceType: "Onboarding Request", 
            request: reqType.label, 
            description, 
            senderFname: user.firstName, 
            senderLname: user.lastName,
            isOnboarding: true,
            onboardingDevices: description,
            onboardingUsers: [],
            navigationLink: `${config.FRONTEND_URL_PROD}/app/external-requests/request-details/${ticketTrail.id}`
          });
          await sendEmailToMultipleUsers([receiver.email], `New Onboarding Request on ITrack`, htmlContent);
        }

      
        const htmlContent = getSimpleAcknowledgmentEmail({
          requesterName: `${user.firstName} ${user.lastName}`,
          ticketId: ticketTrail.ticketId,
          description
        });

        await sendEmail(user.email, `Request Received: ${ticketTrail.ticketId}`, htmlContent);

        return {
          success: true,
          message: "Your onboarding request has been successfully submitted. You will receive an email confirmation shortly.",
          data: {
            externalRequest,
            user,
            ticket: ticketTrail,
          },
        };
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(500, 'Failed to create onboarding request. Please try again later.');
      }
    }

   
    if (!deviceType) {
      throw new AppError(400, 'Device type is required for this request.');
    }

    const deviceTyp = await prisma.deviceType.findFirst({
      where: {
        id: Number(deviceType)
      }
    });

    if (!deviceTyp) {
      throw new AppError(400, 'Invalid device type. Please select a valid device type and try again.');
    }

   
    if (reqType.name === 'lost_report' || reqType.name === 'broken_report') {
      try {
        const device = await prisma.device.findFirst({
          where: {
            deviceTypeId: Number(deviceType),
            assignedUser: email,
          },
          select: {
            id: true,
            deviceTypeId: true,
            assignedUser: true,
            deviceStatus: true
          },
        });

        if (!device) {
          throw new AppError(404, `We couldn't find any record of a ${deviceTyp.name} device assigned to you at the moment. If you need one, please submit a request.`);
        }

        const ticketId = generateTicketId();
        
        const externalRequest = await prisma.externalRequest.create({
          data: {
            email,
            descriptions: description,
            requestTypeId: Number(requestType),
            deviceTypeId: Number(deviceType),
            deviceId: device.id,
            userId: user.id
          },
          include: {
            user: true,
            device: true
          },
        });

        const ticketTrail = await prisma.ticketTrail.create({
          data: {
            ticketId,
            narration: description,
            externalRequest: {
              connect: { id: externalRequest.id }
            }
          }
        });

       
        for (const receiver of recipients) {
          const htmlContent = template({ 
            fname: receiver.firstName, 
            lname: receiver.lastName, 
            deviceType: reqType.name === 'lost_report' ? "Lost Device Report" : "Broken Device Report", 
            request: reqType.label, 
            description, 
            senderFname: user.firstName, 
            senderLname: user.lastName,
            isOnboarding: false
          });
          await sendEmailToMultipleUsers([receiver.email], `New Request on ITrack: ${reqType.label}`, htmlContent);
        }

        
        const htmlContent = getAcknowledgmentEmailTemplate({
          requesterName: `${user.firstName} ${user.lastName}`,
          ticketId: ticketTrail.ticketId
        });

        await sendEmail(user.email, `Request Received: ${ticketTrail.ticketId}`, htmlContent);

        return {
          success: true,
          message: "Your request has been successfully submitted. You will receive an email confirmation shortly.",
          data: {
            externalRequest,
            user,
            ticket: ticketTrail,
          },
        };
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(500, 'Failed to create device report. Please try again later.');
      }
    }

   
    if (reqType.name === 'new_request' && user) {
      try {
        const existingDevice = await prisma.device.findFirst({
          where: {
            deviceTypeId: Number(deviceType),
            assignedUser: email,
          },
          select: {
            id: true,
            deviceTypeId: true,
            assignedUser: true,
            deviceStatus: true
          },
        });

        if (existingDevice) {
          const deviceStatus = await prisma.deviceStatus.findFirst({
            where: { id: parseInt(existingDevice.deviceStatus.id) },
          });

          if (deviceStatus.name !== 'available') {
            throw new AppError(409, `A ${deviceTyp.name} is already assigned to you. If it is lost or damaged, please report it for assistance.`);
          }
        }

        const incompleteRequests = await prisma.externalRequest.findMany({
          where: {
            userId: user.id,
            deviceTypeId: Number(deviceType),
            requestStatus: {
              in: ['PENDING', 'ASSIGNED']
            }
          }
        });

        if (incompleteRequests.length > 0) {
          throw new AppError(409, `You already have a pending request for this device type. Please wait until it has been processed.`);
        }

        const ticketId = generateTicketId();

        const result = await prisma.$transaction(async (prisma) => {
          const externalRequest = await prisma.externalRequest.create({
            data: {
              email,
              descriptions: description,
              requestTypeId: Number(requestType),
              deviceTypeId: Number(deviceType),
              deviceId: null,
              userId: user.id,
            },
            include: {
              user: true,
              device: false,
            },
          });

          const ticketTrail = await prisma.ticketTrail.create({
            data: {
              ticketId,
              narration: description,
              externalRequest: { connect: { id: externalRequest.id } },
            },
          });

          return { externalRequest, ticketTrail };
        });

       
        const htmlContent = getAcknowledgmentEmailTemplate({
          requesterName: `${user.firstName} ${user.lastName}`,
          ticketId: result.ticketTrail.ticketId
        });

        await sendEmail(user.email, `Request Received: ${result.ticketTrail.ticketId}`, htmlContent);

        return {
          success: true,
          message: "Your request has been successfully submitted. You will receive an email confirmation shortly.",
          data: {
            externalRequest: result.externalRequest,
            user,
            ticket: result.ticketTrail,
          },
        };
      } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError(500, 'Failed to create new device request. Please try again later.');
      }
    }

  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, 'An unexpected error occurred while processing your request. Please try again later.');
  }
};

const fetchTickets = async (filters = {}, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const tickets = await prisma.ticketTrail.findMany({
      where: filters,
      include: {
        externalRequest: {
          include: {
            user: true,
            device: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    const totalCount = await prisma.ticketTrail.count({ where: filters });

    return {
      tickets,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    };
  } catch (error) {
    throw new AppError(500, `Error fetching tickets: ${error.message}`);
  }
};

const getExternalRequests = async (page = 1, limit = 10, filters = {}) => {
  try {
    const whereClause = {
      requestTypeId: filters.requestTypeId || undefined,
      ...(filters.ticket_no && {
        ticketTrails: {
          some: {
            ticketId: {
              contains: filters.ticket_no, 
              mode: 'insensitive', 
            },
          },
        },
      }),
    }

    if (filters.requestStatus) {
      whereClause.requestStatus = filters.requestStatus;
    } else if (filters.includeStatuses?.length) {
      whereClause.requestStatus = {
        in: filters.includeStatuses,
      };
    } else if (filters.excludeStatuses?.length) {
      whereClause.requestStatus = {
        notIn: filters.excludeStatuses,
      };
    }

    const [requests, total] = await prisma.$transaction([
      prisma.externalRequest.findMany({
        skip: (page - 1) * limit, 
        take: limit, 
        orderBy: { createdAt: 'desc' },
        where: whereClause,
        include: {        
          user: {
            select: {
              id: true, 
              firstName: true,
              lastName: true,
              roleName: true
            }
          },
          device: {
            include: {
              deviceType: {
                select: { name: true }
              },
              deviceCondition: true,
              manufacturer: true
            }
          },
          requestType: true,
          ticketTrails: true
        },
      }),
      prisma.externalRequest.count({
        where: {
          requestTypeId: filters.requestTypeId || undefined,
          requestStatus: filters.requestStatus || undefined,
          ...(filters.ticket_no && {
            ticketTrails: {
              some: {
                ticketId: {
                  contains: filters.ticket_no, 
                  mode: 'insensitive', 
                },
              },
            },
          }),
        }
      }),
    ]);

    const deviceTypeIds = requests
      .filter(req => !req.device && req.deviceTypeId)
      .map(req => req.deviceTypeId);

    if (deviceTypeIds.length > 0) {
      const deviceTypes = await prisma.deviceType.findMany({
        where: {
          id: {
            in: deviceTypeIds
          }
        },
        select: {
          id: true,
          name: true
        }
      });   
      requests.forEach(request => {
        if (!request.device && request.deviceTypeId) {
          const deviceType = deviceTypes.find(dt => dt.id === request.deviceTypeId);
          if (deviceType) {
            request.deviceType = deviceType;
          }
        }
      });
    }

    return [requests, total];
  } catch (error) {
    throw new AppError(500, `Error fetching external requests: ${error.message}`);
  }
};

const getLostAndBrokenDevicesRequests = async (page = 1, limit = 10, filters = {}) => {
  try {
    return await prisma.$transaction([
      prisma.externalRequest.findMany({
        skip: (page - 1) * limit, 
        take: limit, 
        orderBy: { createdAt: 'desc' },
        where: {
          requestTypeId: filters.requestTypeId || undefined,
          device: filters.manufacturerId ? { manufacturerId: filters.manufacturerId } : undefined,
          createdAt:
            filters.from && filters.to
              ? {
                gte: new Date(filters.from), 
                lte: new Date(filters.to),
              }
              : filters.from
                ? { gte: new Date(filters.from) }
                : filters.to
                  ? { lte: new Date(filters.to) }
                  : undefined,
          requestType: {
            isNot: {
              name: "new_request",
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,  
              firstName: true,
              lastName: true,
              roleName: true
            }
          },
          device: {
            include: {
              deviceType: {
                select: { name: true }
              },
              deviceCondition: true,
              manufacturer: true
            }
          },
          requestType: true,
          ticketTrails: true
        },
      }),
      prisma.externalRequest.count({
        where: {
          requestTypeId: filters.requestTypeId || undefined,
          device: filters.manufacturerId ? { manufacturerId: filters.manufacturerId } : undefined,
          createdAt:
            filters.from && filters.to
              ? {
                gte: new Date(filters.from), 
                lte: new Date(filters.to),
              }
              : filters.from
                ? { gte: new Date(filters.from) }
                : filters.to
                  ? { lte: new Date(filters.to) }
                  : undefined,
          requestType: {
            isNot: {
              name: "new_request",
            },
          },
        },
      }),
    ]);
  } catch (error) {
    throw new AppError(500, `Error fetching lost and broken devices requests: ${error.message}`);
  }
};

const getTicketById = async (id) => {
  try {
    const request = await prisma.externalRequest.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        user: {
          select: {
            id: true,  
            firstName: true,
            lastName: true,
            roleName: true
          }
        },
        assignee: {  
          select: {
            id: true,
            firstName: true,
            lastName: true,
            roleName: true
          }
        },
        device: {
          include: {
            deviceType: {
              select: { name: true }
            },
            deviceCondition: true
          }
        },
        requestType: true,
        ticketTrails: true
      }
    });

    if (!request) {
      throw new AppError(404, `Ticket with ID ${id} not found.`);
    }

    if (!request.device && request.deviceTypeId) {
      const deviceType = await prisma.deviceType.findFirst({
        where: {
          id: request.deviceTypeId
        },
        select: {
          id: true,
          name: true
        }
      });
      
      if (deviceType) {
        request.deviceType = deviceType;
      }
    }

    return request;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(500, `Error fetching ticket by ID: ${error.message}`);
  }
};

const updateTicket = async (req, id, data) => {
  try {
    const updatedTicket = await prisma.externalRequest.update({
      where: { id: Number(id) },
      data,
      include: {
        user: true,
        requestType: true,
        ticketTrails: true
      }
    });

    if (updatedTicket.requestStatus === 'COMPLETED') {    
      const ticketId = updatedTicket.ticketTrails[0]?.id;    

      const adminUsers = await prisma.user.findMany({
        where: {
          roleName: {
            in: ['admin', 'Admin']
          }
        },
        select: {
          email: true,
          firstName: true,
          lastName: true
        }
      });

      const baseUrl = req?.get?.('host')?.includes('localhost')
                      ? config.FRONTEND_URL
                      : config.FRONTEND_URL_PROD;


      for (const admin of adminUsers) {
        const { subject: adminSubject, htmlBody: adminHtmlBody } = getOnboardingCompletedAdminEmail({
          adminName: `${admin.firstName} ${admin.lastName}`,
          ticketId: ticketId,
          requesterName: updatedTicket.user.firstName,
          requestDate: updatedTicket.createdAt,
          baseUrl: baseUrl
        });

        await sendEmail(
          admin.email,
          adminSubject,
          adminHtmlBody
        );
      }
    }

    return updatedTicket;
  } catch (error) {
    throw new AppError(500, `Error updating ticket: ${error.message}`);
  }
};

const updateTicketStatus = async (req, id, action, reason = "") => {
  try {
    const updatedTicketStatus = await prisma.externalRequest.update({
      where: { 
        id: Number(id),
        requestStatus: "PENDING"
      },
      data: {
        requestStatus: action,
        notes: reason,
      },
      include: {
        user: true,
        requestType: true,
        ticketTrails: true
      }
    });

    try{
      if (action === 'APPROVED') {
        const ticketId = updatedTicketStatus.ticketTrails[0]?.ticketId;

        const adminUsers = await prisma.user.findMany({
          where: {
            roleName: {
              in: ['admin', 'Admin']
            }
          },
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        });

        const baseUrl = req?.get?.('host')?.includes('localhost')
                        ? config.FRONTEND_URL
                        : config.FRONTEND_URL_PROD;

        for (const admin of adminUsers) {
          const htmlContent = getRequestApprovedTemplate({
            fname: admin.firstName,
            lname: admin.lastName,
            senderFname: req.user.user.firstName,
            senderLname: req.user.user.lastName,
            requestType: updatedTicketStatus.requestType.label,
            description: updatedTicketStatus.descriptions,
            navigationLink: `${baseUrl}/app/external-requests/request-details/${updatedTicketStatus.id}`
          });

          await sendEmail(
            admin.email,
            `Request ${ticketId} Approved`,
            htmlContent
          );
        }
      }

      if (action === 'REJECTED') {
        const ticketId = updatedTicketStatus.ticketTrails[0]?.ticketId;

        const requestUser = updatedTicketStatus.user;

        const htmlContent = getUserRequestRejectedTemplate({
          fname: requestUser.firstName,
          lname: requestUser.lastName,
          requestType: updatedTicketStatus.requestType.label,
          description: updatedTicketStatus.descriptions,
          reason: reason
        });

        await sendEmail(
          requestUser.email,
          `Request ${ticketId} Rejected`,
          htmlContent
        );
      }
    } catch (err) {
      console.log("Failed to send email", err)
    }

    return updatedTicketStatus;
  } catch (error) {
    throw new AppError(500, `Error updating ticket status: ${error.message}`);
  }
};

export default { submitExternalRequest, fetchTickets, getExternalRequests, getTicketById, updateTicket, getLostAndBrokenDevicesRequests, updateTicketStatus };

