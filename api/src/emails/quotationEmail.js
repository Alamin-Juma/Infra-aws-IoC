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
        <td style="background: ${config.EMAIL?.STYLES?.PRIMARY_COLOR || '#77B634'}; padding: ${config.EMAIL?.TEMPLATES?.BASE?.PADDING || '20px'}; text-align: center;">
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

export const getNewQuotationEmail = ({ quotation, baseUrl }) => {
  const vendorName = quotation.vendor?.name || 'Vendor';
  const submittedByName = quotation.submittedBy ? `${quotation.submittedBy.firstName} ${quotation.submittedBy.lastName}` : 'User';
  const requestId = quotation.procurementRequest?.id || 'N/A';
  const totalAmount = quotation.totalAmount ? `$${quotation.totalAmount.toFixed(2)}` : 'N/A';
  const quotationId = quotation.quotationId || 'N/A';
  const quotationUrl = `${baseUrl}${config.EMAIL?.ROUTES?.QUOTATION || '/app/procurement/quotations'}/${quotation.id}`;
  
  const content = `
    <p>Hello <strong>Finance Team</strong>,</p>
    <p>A new quotation has been submitted for your review:</p>
    <p>Quotation ID: <strong>${quotationId}</strong></p>
    <p>Submitted by: <strong>${submittedByName}</strong></p>
    <p>Vendor: <strong>${vendorName}</strong></p>
    <p>For Procurement Request: <strong>${requestId}</strong></p>
    <p>Total Amount: <strong>${totalAmount}</strong></p>
    <p>Status: <strong>${quotation.status || 'Submitted'}</strong></p>
    <p>You can view the complete details of this quotation by clicking the link below:</p>
    <p><a href="${quotationUrl}" style="color: ${config.EMAIL?.STYLES?.PRIMARY_COLOR || '#77B634'}; text-decoration: underline;">View Quotation Details</a></p>
    <p style="margin-top: ${config.EMAIL?.TEMPLATES?.CONTENT?.MARGIN_TOP || '20px'}; font-size: ${config.EMAIL?.TEMPLATES?.CONTENT?.FONT_SIZE || '14px'}; color: ${config.EMAIL?.STYLES?.SECONDARY_TEXT_COLOR || '#6c757d'};">Best regards,</p>
    <p style="font-size: ${config.EMAIL?.TEMPLATES?.CONTENT?.FONT_SIZE || '14px'}; color: ${config.EMAIL?.STYLES?.SECONDARY_TEXT_COLOR || '#6c757d'};"><strong>iTrack</strong></p>
  `;

  return {
    email: config.FINANCE_EMAIL,
    subject: `New Quotation Submitted: ${quotationId}`,
    htmlBody: getBaseEmailTemplate(content)
  };
};

export const sendQuotationEmail = async (quotation, baseUrl) => {
  try {
    if (!quotation) {      
      return;
    }

    const emailData = getNewQuotationEmail({ quotation, baseUrl });

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
