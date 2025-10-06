import nodemailer from 'nodemailer';
import config from '../configs/app.config.js';

const getBaseEmailTemplate = (content) => {
  return `<!DOCTYPE html>
<html>
<body style="font-family: ${config.EMAIL.TEMPLATES.BASE.FONT_FAMILY}; background-color: ${config.EMAIL.STYLES.BACKGROUND_COLOR}; margin: 0; padding: ${config.EMAIL.TEMPLATES.BASE.PADDING};">
<table role="presentation" style="max-width: ${config.EMAIL.TEMPLATES.BASE.MAX_WIDTH}; width: 100%; background: #ffffff; border-radius: ${config.EMAIL.TEMPLATES.BASE.BORDER_RADIUS};
            box-shadow: ${config.EMAIL.STYLES.BOX_SHADOW}; overflow: hidden; border-collapse: collapse; margin: auto;">
    <!-- Header Section -->
    <tr>
        <td style="background: ${config.EMAIL.STYLES.PRIMARY_COLOR}; padding: ${config.EMAIL.TEMPLATES.BASE.PADDING}; text-align: center;">
            <img src="${config.EMAIL.LOGO_URL}" alt="iTrack" style="max-width: 200px; display: block; margin: auto;">
        </td>
    </tr>

    <!-- Content Section -->
    <tr>
        <td style="padding: ${config.EMAIL.TEMPLATES.BASE.PADDING}; color: ${config.EMAIL.STYLES.TEXT_COLOR}; font-size: ${config.EMAIL.TEMPLATES.BASE.FONT_SIZE};">
            ${content}
        </td>
    </tr>

    <!-- Footer Section -->
    <tr>
        <td style="background: ${config.EMAIL.STYLES.BACKGROUND_COLOR}; padding: 15px; text-align: center; font-size: ${config.EMAIL.TEMPLATES.BASE.FOOTER_FONT_SIZE}; color: ${config.EMAIL.STYLES.SECONDARY_TEXT_COLOR};">
            <p>&copy; 2025 ITrack. All rights reserved.</p>
        </td>
    </tr>
</table>
</body>
</html>`;
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email,
    pass: config.app_password,
  },
});

export const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: config.email,
    to,
    subject,
    html
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    
    throw new Error('Failed to send email', error);
  }
};

export const sendEmailToMultipleUsers = async (recipients, subject, htmlContent) => {
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
    throw error;
  }
};

export const getOnboardingCompletedEmailTemplate = ({ requesterName, ticketId, requestDate, baseUrl }) => {
  const ticketUrl = `${baseUrl}/app/external-requests/request-details/${ticketId}`;

  const content = `
    <p>Hello <strong>${requesterName}</strong>,</p>
    <p>Your onboarding request has been completed successfully.</p>
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${ticketId}</p>
        <p style="margin: 5px 0;"><strong>Request Date:</strong> ${new Date(requestDate).toLocaleDateString()}</p>
    </div>

    <p>You can view the complete details of your request by clicking the link below:</p>
    <p><a href="${ticketUrl}" style="color: ${config.EMAIL.STYLES.PRIMARY_COLOR}; text-decoration: underline;">View Ticket Details</a></p>

    <p>If you have any questions or need further assistance, please don't hesitate to contact our support team.</p>
    
    <p style="margin-top: 20px; font-size: 14px; color: ${config.EMAIL.STYLES.SECONDARY_TEXT_COLOR};">Best regards,</p>
    <p style="font-size: 14px; color: ${config.EMAIL.STYLES.SECONDARY_TEXT_COLOR};"><strong>ITrack</strong></p>
  `;
  return {
    subject: `Your Onboarding Request Completed: ${ticketId}`,
    htmlBody: getBaseEmailTemplate(content)
  };
};

export const getOnboardingCompletedAdminEmail = ({ adminName, ticketId, requesterName, requestDate, baseUrl }) => {
  const ticketUrl = `${baseUrl}/app/external-requests/request-details/${ticketId}`;

  const content = `
    <p>Hello <strong>${adminName}</strong>,</p>
    <p>An onboarding request has been completed:</p>
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Ticket ID:</strong> ${ticketId}</p>
        <p style="margin: 5px 0;"><strong>Requester:</strong> ${requesterName}</p>
        <p style="margin: 5px 0;"><strong>Request Date:</strong> ${new Date(requestDate).toLocaleDateString()}</p>
    </div>

    <p>You can view the complete details of this request by clicking the link below:</p>
    <p><a href="${ticketUrl}" style="color: ${config.EMAIL.STYLES.PRIMARY_COLOR}; text-decoration: underline;">View Ticket Details</a></p>

    <p style="margin-top: 20px; font-size: 14px; color: ${config.EMAIL.STYLES.SECONDARY_TEXT_COLOR};">Best regards,</p>
    <p style="font-size: 14px; color: ${config.EMAIL.STYLES.SECONDARY_TEXT_COLOR};"><strong>iTrack</strong></p>
  `;
  return {
    subject: `Onboarding Request Completed: ${ticketId}`,
    htmlBody: getBaseEmailTemplate(content)
  };
};

export const sendOnboardingEmail = async (to, subject, html) => {
  const mailOptions = {
    from: config.email,
    to: config.ADMIN_EMAIL,
    subject,
    html
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {   
    throw new Error('Failed to send email', error);
  }
};

