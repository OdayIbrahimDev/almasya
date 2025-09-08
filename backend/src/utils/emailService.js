import transporter from './mail.js';
import { 
  getWelcomeEmailTemplate, 
  getNewsletterTemplate, 
  getPasswordResetTemplate,
  getOrderConfirmationTemplate 
} from './emailTemplates.js';

class EmailService {
  constructor() {
    this.isEmailConfigured = Boolean(
      process.env.SMTP_HOST && 
      process.env.SMTP_USER && 
      process.env.SMTP_PASS
    );
  }

  async sendWelcomeEmail(userEmail, userName) {
    try {
      const subject = 'مرحباً بك - مشغولات يدوية أصيلة';
      const html = getWelcomeEmailTemplate(userName, userEmail);

      if (!this.isEmailConfigured) {
        console.log('📧 [DEV MODE] Welcome email would be sent:');
        console.log('📧 To:', userEmail);
        console.log('📧 Subject:', subject);
        console.log('📧 User:', userName);
        return { success: true, messageId: 'dev-mode' };
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: userEmail,
        subject,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendNewsletterEmail(subject, content, subscriberEmails) {
    try {
      if (!subscriberEmails || subscriberEmails.length === 0) {
        return { success: false, error: 'No subscribers found' };
      }

      const unsubscribeLink = `${process.env.FRONTEND_URL || 'https://almasya.com'}/unsubscribe`;
      const html = getNewsletterTemplate(subject, content, unsubscribeLink);

      if (!this.isEmailConfigured) {
        console.log('📧 [DEV MODE] Newsletter would be sent to:', subscriberEmails.length, 'subscribers');
        console.log('📧 Subject:', subject);
        console.log('📧 Subscribers:', subscriberEmails);
        return { success: true, messageId: 'dev-mode', count: subscriberEmails.length };
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        bcc: subscriberEmails, // BCC to hide recipients
        subject,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Newsletter sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId, count: subscriberEmails.length };
    } catch (error) {
      console.error('❌ Error sending newsletter:', error);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(userEmail, userName, resetCode) {
    try {
      const subject = 'رمز إعادة تعيين كلمة المرور';
      const html = getPasswordResetTemplate(userName, resetCode);

      if (!this.isEmailConfigured) {
        console.log('📧 [DEV MODE] Password reset email would be sent:');
        console.log('📧 To:', userEmail);
        console.log('📧 Subject:', subject);
        console.log('📧 User:', userName);
        console.log('📧 Reset Code:', resetCode);
        return { success: true, messageId: 'dev-mode' };
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: userEmail,
        subject,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Password reset email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendOrderConfirmationEmail(userEmail, userName, orderDetails) {
    try {
      const subject = `تأكيد الطلب #${orderDetails.orderId}`;
      const html = getOrderConfirmationTemplate(userName, orderDetails);

      if (!this.isEmailConfigured) {
        console.log('📧 [DEV MODE] Order confirmation email would be sent:');
        console.log('📧 To:', userEmail);
        console.log('📧 Subject:', subject);
        console.log('📧 Order Details:', orderDetails);
        return { success: true, messageId: 'dev-mode' };
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: userEmail,
        subject,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Order confirmation email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending order confirmation email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendContactFormNotification(contactData) {
    try {
      const subject = `رسالة جديدة من ${contactData.name}`;
      const html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>رسالة جديدة</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #a075ad 0%, #8b6a9a 100%); padding: 30px; text-align: center; color: white; }
            .content { padding: 30px; }
            .field { margin-bottom: 20px; padding: 15px; background-color: #f7fafc; border-radius: 8px; }
            .field-label { font-weight: bold; color: #2d3748; margin-bottom: 5px; }
            .field-value { color: #4a5568; }
            .message-field { background-color: #fff5f5; border-right: 4px solid #a075ad; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 رسالة جديدة من موقع Maab Design</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="field-label">الاسم:</div>
                <div class="field-value">${contactData.name}</div>
              </div>
              <div class="field">
                <div class="field-label">البريد الإلكتروني:</div>
                <div class="field-value">${contactData.email}</div>
              </div>
              ${contactData.phone ? `
              <div class="field">
                <div class="field-label">رقم الجوال:</div>
                <div class="field-value">${contactData.phone}</div>
              </div>
              ` : ''}
              <div class="field message-field">
                <div class="field-label">الرسالة:</div>
                <div class="field-value">${contactData.message}</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send to admin email (you can configure this in environment variables)
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      
      if (!this.isEmailConfigured) {
        console.log('📧 [DEV MODE] Contact form notification would be sent to admin:', adminEmail);
        console.log('📧 Contact Data:', contactData);
        return { success: true, messageId: 'dev-mode' };
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: adminEmail,
        subject,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Contact form notification sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error sending contact form notification:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();
