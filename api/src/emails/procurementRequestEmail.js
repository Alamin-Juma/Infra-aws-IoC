import config from '../configs/app.config.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email,
    pass: config.app_password,
  },
});

const getBaseEmailTemplate = (content) => {
  return `<!DOCTYPE html>
<html>
<body style="font-family: ${config.EMAIL?.TEMPLATES?.BASE?.FONT_FAMILY || 'Arial, sans-serif'}; background-color: ${config.EMAIL?.STYLES?.BACKGROUND_COLOR || '#f4f4f4'}; margin: 0; padding: ${config.EMAIL?.TEMPLATES?.BASE?.PADDING || '20px'};">
<table role="presentation" style="max-width: ${config.EMAIL?.TEMPLATES?.BASE?.MAX_WIDTH || '600px'}; width: 100%; background: #ffffff; border-radius: ${config.EMAIL?.TEMPLATES?.BASE?.BORDER_RADIUS || '5px'};
            box-shadow: ${config.EMAIL?.STYLES?.BOX_SHADOW || '0 2px 4px rgba(0,0,0,0.1)'}; overflow: hidden; border-collapse: collapse; margin: auto;">
    <!-- Header Section -->
    <tr>
        <td style="background: ${config.EMAIL?.STYLES?.PRIMARY_COLOR || '#007bff'}; padding: ${config.EMAIL?.TEMPLATES?.BASE?.PADDING || '20px'}; text-align: center;">
            <img src="${config.EMAIL?.LOGO_URL || ''}" alt="iTrack" style="max-width: ${config.EMAIL?.TEMPLATES?.BASE?.LOGO_MAX_WIDTH || '150px'}; display: block; margin: auto;">
        </td>
    </tr>

    <!-- Content Section -->
    <tr>
        <td style="padding: ${config.EMAIL?.TEMPLATES?.BASE?.PADDING || '20px'}; color: ${config.EMAIL?.STYLES?.TEXT_COLOR || '#333'}; font-size: ${config.EMAIL?.TEMPLATES?.BASE?.FONT_SIZE || '14px'};">
            ${content}
        </td>
    </tr>

    <!-- Footer Section -->
    <tr>
        <td style="background: ${config.EMAIL?.STYLES?.BACKGROUND_COLOR || '#f4f4f4'}; padding: 15px; text-align: center; font-size: ${config.EMAIL?.TEMPLATES?.BASE?.FOOTER_FONT_SIZE || '12px'}; color: ${config.EMAIL?.STYLES?.SECONDARY_TEXT_COLOR || '#6c757d'};">
            <p>${config.EMAIL?.COPYRIGHT || '© 2024 iTrack. All rights reserved.'}</p>
        </td>
    </tr>
</table>
</body>
</html>`;
};

export const getNewProcurementRequestEmail = ({ request, baseUrl }) => {
  const adminName = config.EMAIL?.DEFAULT_NAMES?.ADMIN || 'Admin';
  const itStaffName = request.CreatedBy ? `${request.CreatedBy.firstName} ${request.CreatedBy.lastName}` : 'IT Staff';
  const requestUrl = `${baseUrl}${config.EMAIL?.ROUTES?.PROCUREMENT_REQUEST || '/app/procurement/procurement-request'}/${request.id}`;
  
  const content = `
    <p>Hello <strong>${adminName}</strong>,</p>
    <p>A new procurement request <strong>${request.id}</strong> has been submitted by <strong>${itStaffName}</strong> on iTrack:</p>
    <p>You can view the complete details of this request by clicking the link below:</p>
    <p><a href="${requestUrl}" style="color: ${config.EMAIL?.STYLES?.PRIMARY_COLOR || '#007bff'}; text-decoration: underline;">View Request Details</a></p>
    <p style="margin-top: ${config.EMAIL?.TEMPLATES?.CONTENT?.MARGIN_TOP || '20px'}; font-size: ${config.EMAIL?.TEMPLATES?.CONTENT?.FONT_SIZE || '14px'}; color: ${config.EMAIL?.STYLES?.SECONDARY_TEXT_COLOR || '#6c757d'};">Best regards,</p>
    <p style="font-size: ${config.EMAIL?.TEMPLATES?.CONTENT?.FONT_SIZE || '14px'}; color: ${config.EMAIL?.STYLES?.SECONDARY_TEXT_COLOR || '#6c757d'};"><strong>iTrack</strong></p>
  `;

  return {
    email: config.ADMIN_EMAIL,
    subject: `New Procurement Request: ${request.id}`,
    htmlBody: getBaseEmailTemplate(content)
  };
};

export const getPendingProcurementRequestEmail = ({ request, reason, baseUrl }) => {
  const itStaffName = request.CreatedBy ? `${request.CreatedBy.firstName} ${request.CreatedBy.lastName}` : 'IT Staff';
  const requestUrl = `${baseUrl}${config.EMAIL?.ROUTES?.PROCUREMENT_REQUEST || '/app/procurement/procurement-request'}/${request.id}`;
  
  const content = `
    <p>Hello <strong>${itStaffName}</strong>,</p>
    <p>Kindly review your request <strong>${request.id}</strong> as advised from the comments there in and re-submit.</p>
    <p>Comments:</p>
    <p style="background-color: ${config.EMAIL?.STYLES?.COMMENT_BACKGROUND || '#f8f9fa'}; padding: ${config.EMAIL?.STYLES?.COMMENT_PADDING || '15px'}; border-radius: ${config.EMAIL?.STYLES?.COMMENT_BORDER_RADIUS || '5px'}; margin: ${config.EMAIL?.STYLES?.COMMENT_MARGIN || '10px 0'};">${reason}</p>
    <p>You can view the complete details of this request by clicking the link below:</p>
    <p><a href="${requestUrl}" style="color: ${config.EMAIL?.STYLES?.PRIMARY_COLOR || '#007bff'}; text-decoration: underline;">View Request Details</a></p>
    <p style="margin-top: ${config.EMAIL?.TEMPLATES?.CONTENT?.MARGIN_TOP || '20px'}; font-size: ${config.EMAIL?.TEMPLATES?.CONTENT?.FONT_SIZE || '14px'}; color: ${config.EMAIL?.STYLES?.SECONDARY_TEXT_COLOR || '#6c757d'};">Best regards,</p>
    <p style="font-size: ${config.EMAIL?.TEMPLATES?.CONTENT?.FONT_SIZE || '14px'}; color: ${config.EMAIL?.STYLES?.SECONDARY_TEXT_COLOR || '#6c757d'};"><strong>iTrack</strong></p>
  `;

  return {
    email: request.CreatedBy?.email || config.ADMIN_EMAIL,
    subject: `Additional Information Required: ${request.id}`,
    htmlBody: getBaseEmailTemplate(content)
  };
};

export const getRejectedProcurementRequestEmail = ({ request, reason, baseUrl }) => {
  const itStaffName = request.CreatedBy ? `${request.CreatedBy.firstName} ${request.CreatedBy.lastName}` : 'IT Staff';
  const requestUrl = `${baseUrl}${config.EMAIL?.ROUTES?.PROCUREMENT_REQUEST || '/app/procurement/procurement-request'}/${request.id}`;
  
  const content = `
    <p>Hello <strong>${itStaffName}</strong>,</p>
    <p>Your Request <strong>${request.id}</strong> has been rejected on iTrack:</p>
    <p>Comments:</p>
    <p style="background-color: ${config.EMAIL?.STYLES?.COMMENT_BACKGROUND || '#f8f9fa'}; padding: ${config.EMAIL?.STYLES?.COMMENT_PADDING || '15px'}; border-radius: ${config.EMAIL?.STYLES?.COMMENT_BORDER_RADIUS || '5px'}; margin: ${config.EMAIL?.STYLES?.COMMENT_MARGIN || '10px 0'};">${reason}</p>
    <p>You can view the complete details of this request by clicking the link below:</p>
    <p><a href="${requestUrl}" style="color: ${config.EMAIL?.STYLES?.PRIMARY_COLOR || '#007bff'}; text-decoration: underline;">View Request Details</a></p>
    <p style="margin-top: ${config.EMAIL?.TEMPLATES?.CONTENT?.MARGIN_TOP || '20px'}; font-size: ${config.EMAIL?.TEMPLATES?.CONTENT?.FONT_SIZE || '14px'}; color: ${config.EMAIL?.STYLES?.SECONDARY_TEXT_COLOR || '#6c757d'};">Best regards,</p>
    <p style="font-size: ${config.EMAIL?.TEMPLATES?.CONTENT?.FONT_SIZE || '14px'}; color: ${config.EMAIL?.STYLES?.SECONDARY_TEXT_COLOR || '#6c757d'};"><strong>iTrack</strong></p>
  `;

  return {
    email: request.CreatedBy?.email || config.ADMIN_EMAIL,
    subject: `Procurement Request Rejected: ${request.id}`,
    htmlBody: getBaseEmailTemplate(content)
  };
};

export const getInProgressProcurementRequestEmail = ({ request, baseUrl }) => {
  const adminName = config.EMAIL?.DEFAULT_NAMES?.ADMIN || 'Admin';
  const itStaffName = request.CreatedBy ? `${request.CreatedBy.firstName} ${request.CreatedBy.lastName}` : 'IT Staff';
  const requestUrl = `${baseUrl}${config.EMAIL?.ROUTES?.PROCUREMENT_REQUEST || '/app/procurement/procurement-request'}/${request.id}`;
  
  const content = `
    <p>Hello <strong>${adminName}</strong>,</p>
    <p>A new procurement request <strong>${request.id}</strong> has been submitted by <strong>${itStaffName}</strong> on iTrack:</p>
    <p>You can view the complete details of this request by clicking the link below:</p>
    <p><a href="${requestUrl}" style="color: ${config.EMAIL?.STYLES?.PRIMARY_COLOR || '#007bff'}; text-decoration: underline;">View Request Details</a></p>
    <p style="margin-top: ${config.EMAIL?.TEMPLATES?.CONTENT?.MARGIN_TOP || '20px'}; font-size: ${config.EMAIL?.TEMPLATES?.CONTENT?.FONT_SIZE || '14px'}; color: ${config.EMAIL?.STYLES?.SECONDARY_TEXT_COLOR || '#6c757d'};">Best regards,</p>
    <p style="font-size: ${config.EMAIL?.TEMPLATES?.CONTENT?.FONT_SIZE || '14px'}; color: ${config.EMAIL?.STYLES?.SECONDARY_TEXT_COLOR || '#6c757d'};"><strong>iTrack</strong></p>
  `;

  return {
    email: config.ADMIN_EMAIL,
    subject: `New Procurement Request for Review: ${request.id}`,
    htmlBody: getBaseEmailTemplate(content)
  };
};

export const getApprovedProcurementRequestEmail = ({ request, reason, baseUrl }) => {
  const itStaffName = request.CreatedBy ? `${request.CreatedBy.firstName} ${request.CreatedBy.lastName}` : 'IT Staff';
  const requestUrl = `${baseUrl}${config.EMAIL?.ROUTES?.PROCUREMENT_REQUEST || '/app/procurement/procurement-request'}/${request.id}`;
  
  const content = `
    <p>Hello <strong>${itStaffName}</strong>,</p>
    <p>Your Request <strong>${request.id}</strong> has been approved on iTrack:</p>
    ${reason ? `<p>Comments:</p>
    <p style="background-color: ${config.EMAIL?.STYLES?.COMMENT_BACKGROUND || '#f8f9fa'}; padding: ${config.EMAIL?.STYLES?.COMMENT_PADDING || '15px'}; border-radius: ${config.EMAIL?.STYLES?.COMMENT_BORDER_RADIUS || '5px'}; margin: ${config.EMAIL?.STYLES?.COMMENT_MARGIN || '10px 0'};">${reason}</p>` : ''}
    <p>You can view the complete details of this request by clicking the link below:</p>
    <p><a href="${requestUrl}" style="color: ${config.EMAIL?.STYLES?.PRIMARY_COLOR || '#007bff'}; text-decoration: underline;">View Request Details</a></p>
    <p style="margin-top: ${config.EMAIL?.TEMPLATES?.CONTENT?.MARGIN_TOP || '20px'}; font-size: ${config.EMAIL?.TEMPLATES?.CONTENT?.FONT_SIZE || '14px'}; color: ${config.EMAIL?.STYLES?.SECONDARY_TEXT_COLOR || '#6c757d'};">Best regards,</p>
    <p style="font-size: ${config.EMAIL?.TEMPLATES?.CONTENT?.FONT_SIZE || '14px'}; color: ${config.EMAIL?.STYLES?.SECONDARY_TEXT_COLOR || '#6c757d'};"><strong>iTrack</strong></p>
  `;

  return {
    email: request.CreatedBy?.email || config.ADMIN_EMAIL,
    subject: `Procurement Request Approved: ${request.id}`,
    htmlBody: getBaseEmailTemplate(content)
  };
};

export const sendProcurementRequestEmail = async (request, type, reason = '', baseUrl) => {
  try {   
    if (!request) {     
      return;
    }

    let emailData;
    
    switch (type) {
      case 'in_progress':
        emailData = getInProgressProcurementRequestEmail({ request, baseUrl });
        break;
      case 'pending':
        emailData = getPendingProcurementRequestEmail({ request, reason, baseUrl });
        break;
      case 'rejected':
        emailData = getRejectedProcurementRequestEmail({ request, reason, baseUrl });
        break;
      case 'approved':
        emailData = getApprovedProcurementRequestEmail({ request, reason, baseUrl });
        break;
      default:
        emailData = getNewProcurementRequestEmail({ request, baseUrl });
    }

    const mailOptions = {
      from: config.email,
      to: emailData.email,
      subject: emailData.subject,
      html: emailData.htmlBody
    };

    await transporter.sendMail(mailOptions);
    
  } catch {
    
  }
}; 
