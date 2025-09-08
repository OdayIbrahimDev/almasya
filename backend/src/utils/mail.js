import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded even if this module is imported before DB setup
dotenv.config();

// Resolve SMTP configuration from environment
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpSecure = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser;

// Check if email is configured
const isEmailConfigured = Boolean(smtpHost && smtpUser && smtpPass);

console.log('📧 Email configuration status:', isEmailConfigured ? 'Configured' : 'Not configured');
if (isEmailConfigured) {
  console.log('📧 SMTP host:', smtpHost, '| port:', smtpPort, '| secure:', smtpSecure);
}

// Create transporter for generic SMTP
const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })
  : null;

export const sendResetCodeEmail = async (email, resetCode, userName) => {
  try {
    // If email is not configured, just log the code for development
    if (!isEmailConfigured) {
      console.log('📧 [DEV MODE] Reset code email would be sent:');
      console.log('📧 To:', email);
      console.log('📧 Code:', resetCode);
      console.log('📧 User:', userName);
      console.log('📧 Configure SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS in .env to enable real email sending');
      return true; // Return true to simulate success
    }

    console.log('📧 [PRODUCTION MODE] Sending real email to:', email);

    const mailOptions = {
      from: smtpFrom,
      to: email,
      subject: 'رمز إعادة تعيين كلمة المرور',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">مرحباً ${userName}</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="color: #333; font-size: 14px; margin-bottom: 10px;">رمز إعادة التعيين الخاص بك:</p>
              <div style="background-color: white; padding: 15px; border: 2px solid #007bff; border-radius: 8px; display: inline-block;">
                <span style="font-family: monospace; font-size: 24px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${resetCode}</span>
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              <strong>ملاحظات مهمة:</strong><br>
              • هذا الرمز صالح لمدة ساعة واحدة فقط<br>
              • لا تشارك هذا الرمز مع أي شخص<br>
              • إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px;">
                مع تحيات فريقنا
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Reset code email sent successfully:', info.messageId);
    console.log('📧 Email details:', {
      to: email,
      messageId: info.messageId,
      response: info.response
    });
    return true;
  } catch (error) {
    console.error('❌ Error sending reset code email:', error);
    console.error('❌ Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    return false;
  }
};

export default transporter;
