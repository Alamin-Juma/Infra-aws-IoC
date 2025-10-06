import config from '../../configs/app.config.js';
import transporter from '../../emails/emailTransporter.js';
import email_templates from '../../emails/app.templates.js';

export const sendEmail = async (req, res) => {
    try {
        const { email, subject, htmlBody, template, data } = req.body;
        let emailBody = "";
        if (template && template in email_templates) {
            switch (template) {
                case "lock_account":
                    emailBody = manageLockAccountTemplate(email_templates[template], data);
                    break;

                default:
                    emailBody = email_templates[template];
                    break;
            }

        } else {
            emailBody = htmlBody;
        }
        const mailOptions = {
            from: config.email,
            to: email,
            subject: subject,
            html: emailBody,
        };

        const info = await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Email sent successfully", info });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send email", error });
    }

}

function manageLockAccountTemplate(template, data) {
    if (template.includes("[LOCKED_EMAIL]")) {
        template = template.replace("[LOCKED_EMAIL]", data.account_to_lock);
    }
    return template;
}
