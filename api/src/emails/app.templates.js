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
            <p>&copy; 2025 iTrack. All rights reserved.</p>
        </td>
    </tr>
</table>
</body>
</html>`;
};

function getLockAccountMarkUp() {
  const content = `
    <h1 style="color: #d9534f; text-align: center;">Security Alert</h1>
    <p style="color: #333;">We have detected multiple unsuccessful login attempts for <b>[LOCKED_EMAIL]</b>.</p>
    <p style="color: #555;">As a security measure, please review this activity and take appropriate action if necessary.</p>
    <p style="margin-top: 20px; font-size: 14px; color: ${config.EMAIL.STYLES.SECONDARY_TEXT_COLOR};">Best regards,</p>
    <p style="font-size: 14px; color: ${config.EMAIL.STYLES.SECONDARY_TEXT_COLOR};"><strong>iTrack</strong></p>
  `;
  return getBaseEmailTemplate(content);
}

function getOnboardingCompletedMarkUp() {
  const content = `
    <h3 style="color: #333; margin-bottom: 10px;">Hello {{fname}} {{lname}},</h3>
    <p>The onboarding request has been completed with the following details:</p>
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="margin: 5px 0;"><strong>Request Type:</strong> {{requestType}}</li>
            <li style="margin: 5px 0;"><strong>Ticket ID:</strong> {{ticketId}}</li>
            <li style="margin: 5px 0;"><strong>Requested By:</strong> {{requesterName}}</li>
            <li style="margin: 5px 0;"><strong>Request Date:</strong> {{requestDate}}</li>
            <li style="margin: 5px 0;"><strong>Completion Date:</strong> {{completionDate}}</li>
            <li style="margin: 5px 0;"><strong>Devices Assigned:</strong> {{devices}}</li>
        </ul>
    </div>

    <p>All devices have been assigned and are ready for delivery to the new hires.</p>
    
    <p style="margin-top: 20px; font-size: 14px; color: ${config.EMAIL.STYLES.SECONDARY_TEXT_COLOR};">Best regards,</p>
    <p style="font-size: 14px; color: ${config.EMAIL.STYLES.SECONDARY_TEXT_COLOR};"><strong>iTrack</strong></p>
  `;
  return getBaseEmailTemplate(content);
}

const email_templates = {
    'lock_account': getLockAccountMarkUp(),
    'onboarding_completed': getOnboardingCompletedMarkUp(),
};

export default email_templates;
