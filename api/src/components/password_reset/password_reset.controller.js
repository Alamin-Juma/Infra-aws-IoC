import passwordResetService from './password_reset.service.js';
import config from '../../configs/app.config.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

export const forgotPassword = async (req, res) => {
    try {
        const user = await passwordResetService.getUserByEmail(req.body.email);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const generated_token = generatePasswordResetToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);  // 24 hours from now
        const password_reset = await passwordResetService.createPasswordReset({ userId: user.id, token: generated_token, status: false, expiresAt: expiresAt });
        sendPasswordResetEmail(req, req.body.email, generated_token);
        res.status(201).json(password_reset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        if (!req.body.password) return res.status(400).json({ error: 'Bad Request', message: 'password is missing' });
        if (!req.body.token) return res.status(400).json({ error: 'Bad Request', message: 'token is missing' });
        const passwordReset = await passwordResetService.getPasswordResetByToken(req.body.token);
        if (!passwordReset) return res.status(404).json({ error: 'Invalid token' });
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const updatePayload = { where: { id: Number(passwordReset.userId) }, data: { password: hashedPassword } };
        await passwordResetService.updateUserPassword(updatePayload);
        const forgotPayload = { where: { id: Number(passwordReset.id) }, data: { status: true } };
        await passwordResetService.updateForgotPassword(forgotPayload);
        res.status(201).json({ message: 'Password updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const validateToken = async (req, res) => {
    try {
        if (!req.params.token) return res.status(400).json({ error: 'Bad Request', message: 'token is missing' });
        const passwordReset = await passwordResetService.getPasswordResetByToken(req.params.token);
        if (!passwordReset) return res.status(404).json({ error: 'Invalid token' });
        res.status(200).json({ message: 'Token validated successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

function generatePasswordResetToken() {
    const token = crypto.randomBytes(32).toString('hex'); // Generates a random 64-character hex string
    return token;
}

async function sendPasswordResetEmail(req, userEmail, resetToken) {
    //const protocol = req.protocol; // http or https
    const host = req.get('host');   // Get the host from the request
    const password_reset_url = host.includes('localhost') ? config.FRONTEND_URL : config.FRONTEND_URL_PROD;
    const base_url = host.includes('localhost') ? config.API_BASE_URL : config.API_BASE_URL_PROD;
    const resetLink = `${password_reset_url}/auth/reset-password/${resetToken}`;

    sendEmailViaApi(base_url,userEmail, 'Forgot Password Request', getHtmlEmailMarkup(resetLink));
}

async function sendEmailViaApi(base_url, email, subject, htmlMarkup) {
    try {
        const response = await fetch(`${base_url}/email/send-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                subject: subject,
                email: email,
                htmlBody: htmlMarkup
            }),
        });

    } catch (error) {
       throw new Error('Unable to send email: ' + error.message);
    }
}

function getHtmlEmailMarkup(resetLink) {
    const html = `<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
        
        <!-- Header Section -->
        <div style="background: #77B634; padding: 20px; text-align: center;">
            <img src="https://res.cloudinary.com/dr8syainc/image/upload/v1742228014/logowhite_hfci38.png" alt="Itrack"
                 style="max-width: 2500px; display: block; margin: 0 auto;">
        </div>

        <!-- Content Section -->
        <div style="padding: 20px; text-align: left; color: #333;">
            <h2 style="color: #333; margin-bottom: 10px;">Hello,</h2>
            <p>You requested a password reset. Please use the link below to reset your password.</p>
            
            <!-- Fixes Email Button Issues -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                    <td style="border-radius: 5px; background: #77B634;">
                        <a href="${resetLink}"
                           style="display: inline-block; padding: 12px 20px; font-size: 16px;
                                  color: white; text-decoration: none; border-radius: 5px; background: #77B634;">
                            Reset Password
                        </a>
                    </td>
                </tr>
            </table>
            
            <p>The link will expire in <strong>24 hours</strong>. If you did not request this, please ignore this email.</p>
            <p>Thank you,<br><strong>Itrack</strong></p>
        </div>

        <!-- Footer Section -->
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            <p>&copy; 2025 Itrack. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    return html;
}

const hashPassword = async (password) => {
    try {
        // Generate a salt with a cost factor of 10
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
    }
};
