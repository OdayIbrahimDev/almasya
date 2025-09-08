// Beautiful Email Templates
// All templates are RTL-friendly and responsive

export const getWelcomeEmailTemplate = (userName, userEmail) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>مرحباً بك</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #a075ad 0%, #8b6a9a 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
        .content { padding: 40px 30px; }
        .welcome-section { text-align: center; margin-bottom: 40px; }
        .welcome-section h2 { color: #2d3748; font-size: 24px; margin-bottom: 15px; }
        .welcome-section p { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
        .features { display: flex; flex-direction: column; gap: 20px; margin: 30px 0; }
        .feature { display: flex; align-items: center; padding: 20px; background-color: #f7fafc; border-radius: 12px; border-right: 4px solid #a075ad; }
        .feature-icon { width: 50px; height: 50px; background: linear-gradient(135deg, #a075ad, #8b6a9a); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-left: 15px; }
        .feature-icon span { color: white; font-size: 20px; }
        .feature-content h3 { color: #2d3748; margin: 0 0 5px 0; font-size: 18px; }
        .feature-content p { color: #4a5568; margin: 0; font-size: 14px; line-height: 1.5; }
        .cta-section { text-align: center; margin: 40px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #a075ad, #8b6a9a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: transform 0.2s; }
        .cta-button:hover { transform: translateY(-2px); }
        .social-section { text-align: center; margin: 30px 0; }
        .social-links { display: flex; justify-content: center; gap: 15px; margin-top: 15px; }
        .social-link { display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #a075ad, #8b6a9a); border-radius: 50%; text-align: center; line-height: 40px; color: white; text-decoration: none; }
        .footer { background-color: #2d3748; color: white; padding: 30px; text-align: center; }
        .footer p { margin: 5px 0; font-size: 14px; }
        .footer a { color: #a075ad; text-decoration: none; }
        @media (max-width: 600px) {
          .container { margin: 0; }
          .content { padding: 20px; }
          .header { padding: 30px 20px; }
          .feature { flex-direction: column; text-align: center; }
          .feature-icon { margin: 0 0 15px 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 مرحباً بك في متجرنا</h1>
          <p>مشغولات يدوية وكروشيه أصيلة منذ 2019</p>
        </div>
        
        <div class="content">
          <div class="welcome-section">
            <h2>أهلاً وسهلاً ${userName}!</h2>
            <p>نحن سعداء جداً بانضمامك إلينا. نقدم منتجات مميزة بجودة عالية وتجربة تسوق رائعة.</p>
          </div>
          
          <div class="features">
            <div class="feature">
              <div class="feature-icon">
                <span>🧶</span>
              </div>
              <div class="feature-content">
                <h3>منتجات يدوية أصيلة</h3>
                <p>طواقي كروشيه رجالية، شالات، وإكسسوارات هاند ميد بتصاميم سودانية مميزة</p>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">
                <span>🚚</span>
              </div>
              <div class="feature-content">
                <h3>شحن لكل الدول</h3>
                <p>نشحن منتجاتنا إلى جميع أنحاء العالم مع ضمان الجودة والأمان</p>
              </div>
            </div>
            
            <div class="feature">
              <div class="feature-icon">
                <span>💼</span>
              </div>
              <div class="feature-content">
                <h3>جملة وقطعة</h3>
                <p>نعمل مع المحلات والأفراد، نقدم أسعار تنافسية للجملة والقطعة</p>
              </div>
            </div>
          </div>
          
          <div class="cta-section">
            <a href="${process.env.FRONTEND_URL || 'https://almasya.com'}/products" class="cta-button">
              اكتشف منتجاتنا الآن
            </a>
          </div>
          
          <div class="social-section">
            <h3 style="color: #2d3748; margin-bottom: 15px;">تابعنا على وسائل التواصل الاجتماعي</h3>
            <div class="social-links">
              <a href="https://www.facebook.com/share/1BjfTqEJjH/" class="social-link" target="_blank">📘</a>
              <a href="#" class="social-link" target="_blank">📷</a>
              <a href="#" class="social-link" target="_blank">🎵</a>
              <a href="https://wa.me/message/GAYCPDLPDHLSH1" class="social-link" target="_blank">💬</a>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>متجرنا</strong></p>
          <p>مشغولات يدوية وكروشيه أصيلة منذ 2019</p>
          <p>📍 القاهرة، مصر | 🌍 نشحن لكل الدول</p>
          <p>
            <a href="${process.env.FRONTEND_URL || 'https://almasya.com'}/contact">تواصل معنا</a> | 
            <a href="${process.env.FRONTEND_URL || 'https://almasya.com'}/about">من نحن</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getNewsletterTemplate = (subject, content, unsubscribeLink) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #a075ad 0%, #8b6a9a 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
        .content { padding: 40px 30px; }
        .newsletter-content { color: #2d3748; font-size: 16px; line-height: 1.8; }
        .newsletter-content h2 { color: #a075ad; font-size: 24px; margin: 30px 0 20px 0; }
        .newsletter-content h3 { color: #4a5568; font-size: 20px; margin: 25px 0 15px 0; }
        .newsletter-content p { margin-bottom: 20px; }
        .newsletter-content ul, .newsletter-content ol { margin: 20px 0; padding-right: 20px; }
        .newsletter-content li { margin-bottom: 10px; }
        .highlight-box { background: linear-gradient(135deg, #f7fafc, #edf2f7); border-right: 4px solid #a075ad; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .cta-section { text-align: center; margin: 40px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #a075ad, #8b6a9a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
        .social-section { text-align: center; margin: 30px 0; padding: 20px; background-color: #f7fafc; border-radius: 12px; }
        .social-links { display: flex; justify-content: center; gap: 15px; margin-top: 15px; }
        .social-link { display: inline-block; width: 40px; height: 40px; background: linear-gradient(135deg, #a075ad, #8b6a9a); border-radius: 50%; text-align: center; line-height: 40px; color: white; text-decoration: none; }
        .footer { background-color: #2d3748; color: white; padding: 30px; text-align: center; }
        .footer p { margin: 5px 0; font-size: 14px; }
        .footer a { color: #a075ad; text-decoration: none; }
        .unsubscribe { margin-top: 20px; padding-top: 20px; border-top: 1px solid #4a5568; }
        .unsubscribe a { color: #a075ad; font-size: 12px; }
        @media (max-width: 600px) {
          .container { margin: 0; }
          .content { padding: 20px; }
          .header { padding: 30px 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 ${subject}</h1>
          <p>متجرنا - منتجات مميزة</p>
        </div>
        
        <div class="content">
          <div class="newsletter-content">
            ${content}
          </div>
          
          <div class="cta-section">
            <a href="${process.env.FRONTEND_URL || 'https://almasya.com'}/products" class="cta-button">
              شاهد منتجاتنا الجديدة
            </a>
          </div>
          
          <div class="social-section">
            <h3 style="color: #2d3748; margin-bottom: 15px;">تابعنا للحصول على آخر التحديثات</h3>
            <div class="social-links">
              <a href="https://www.facebook.com/share/1BjfTqEJjH/" class="social-link" target="_blank">📘</a>
              <a href="#" class="social-link" target="_blank">📷</a>
              <a href="#" class="social-link" target="_blank">🎵</a>
              <a href="https://wa.me/message/GAYCPDLPDHLSH1" class="social-link" target="_blank">💬</a>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Maab Design</strong></p>
          <p>مشغولات يدوية وكروشيه أصيلة منذ 2019</p>
          <p>📍 القاهرة، مصر | 🌍 نشحن لكل الدول</p>
          <p>
            <a href="${process.env.FRONTEND_URL || 'https://almasya.com'}/contact">تواصل معنا</a> | 
            <a href="${process.env.FRONTEND_URL || 'https://almasya.com'}/about">من نحن</a>
          </p>
          <div class="unsubscribe">
            <a href="${unsubscribeLink}">إلغاء الاشتراك</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getPasswordResetTemplate = (userName, resetCode) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>إعادة تعيين كلمة المرور</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #a075ad 0%, #8b6a9a 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
        .content { padding: 40px 30px; }
        .reset-section { text-align: center; margin-bottom: 40px; }
        .reset-section h2 { color: #2d3748; font-size: 24px; margin-bottom: 15px; }
        .reset-section p { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
        .code-container { background: linear-gradient(135deg, #f7fafc, #edf2f7); border: 2px solid #a075ad; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; }
        .code-label { color: #4a5568; font-size: 16px; margin-bottom: 15px; font-weight: 500; }
        .reset-code { font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: #a075ad; letter-spacing: 8px; background-color: white; padding: 20px; border-radius: 8px; border: 2px dashed #a075ad; display: inline-block; }
        .instructions { background-color: #fff5f5; border-right: 4px solid #f56565; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .instructions h3 { color: #c53030; margin: 0 0 15px 0; font-size: 18px; }
        .instructions ul { margin: 0; padding-right: 20px; }
        .instructions li { color: #4a5568; margin-bottom: 8px; font-size: 14px; }
        .security-notice { background-color: #f0fff4; border-right: 4px solid #48bb78; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .security-notice h3 { color: #2f855a; margin: 0 0 15px 0; font-size: 18px; }
        .security-notice p { color: #4a5568; margin: 0; font-size: 14px; line-height: 1.5; }
        .cta-section { text-align: center; margin: 40px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #a075ad, #8b6a9a); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; }
        .footer { background-color: #2d3748; color: white; padding: 30px; text-align: center; }
        .footer p { margin: 5px 0; font-size: 14px; }
        .footer a { color: #a075ad; text-decoration: none; }
        @media (max-width: 600px) {
          .container { margin: 0; }
          .content { padding: 20px; }
          .header { padding: 30px 20px; }
          .reset-code { font-size: 24px; letter-spacing: 4px; padding: 15px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 إعادة تعيين كلمة المرور</h1>
          <p>متجرنا - منتجات مميزة</p>
        </div>
        
        <div class="content">
          <div class="reset-section">
            <h2>مرحباً ${userName}</h2>
            <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. استخدم الرمز أدناه لإعادة تعيين كلمة المرور الخاصة بك.</p>
          </div>
          
          <div class="code-container">
            <div class="code-label">رمز إعادة التعيين الخاص بك:</div>
            <div class="reset-code">${resetCode}</div>
          </div>
          
          <div class="instructions">
            <h3>📋 تعليمات الاستخدام:</h3>
            <ul>
              <li>انسخ الرمز أعلاه أو اكتبه كما هو</li>
              <li>اذهب إلى صفحة إعادة تعيين كلمة المرور</li>
              <li>أدخل الرمز في الحقل المخصص</li>
              <li>أدخل كلمة المرور الجديدة</li>
              <li>تأكد من كلمة المرور وأرسل الطلب</li>
            </ul>
          </div>
          
          <div class="security-notice">
            <h3>🛡️ ملاحظات أمنية مهمة:</h3>
            <p>• هذا الرمز صالح لمدة ساعة واحدة فقط من وقت إرسال هذا البريد الإلكتروني<br>
            • لا تشارك هذا الرمز مع أي شخص آخر<br>
            • إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني بأمان<br>
            • في حالة الشك، يرجى التواصل معنا فوراً</p>
          </div>
          
          <div class="cta-section">
            <a href="${process.env.FRONTEND_URL || 'https://almasya.com'}/resetPassword" class="cta-button">
              إعادة تعيين كلمة المرور
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>متجرنا</strong></p>
          <p>مشغولات يدوية وكروشيه أصيلة منذ 2019</p>
          <p>📍 القاهرة، مصر | 🌍 نشحن لكل الدول</p>
          <p>
            <a href="${process.env.FRONTEND_URL || 'https://almasya.com'}/contact">تواصل معنا</a> | 
            <a href="${process.env.FRONTEND_URL || 'https://almasya.com'}/about">من نحن</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const getOrderConfirmationTemplate = (userName, orderDetails) => {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تأكيد الطلب</title>
      <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #a075ad 0%, #8b6a9a 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
        .content { padding: 40px 30px; }
        .order-section { text-align: center; margin-bottom: 40px; }
        .order-section h2 { color: #2d3748; font-size: 24px; margin-bottom: 15px; }
        .order-section p { color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
        .order-details { background-color: #f7fafc; border-radius: 12px; padding: 30px; margin: 30px 0; }
        .order-details h3 { color: #a075ad; margin: 0 0 20px 0; font-size: 20px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #4a5568; font-weight: 500; }
        .detail-value { color: #2d3748; font-weight: 600; }
        .footer { background-color: #2d3748; color: white; padding: 30px; text-align: center; }
        .footer p { margin: 5px 0; font-size: 14px; }
        .footer a { color: #a075ad; text-decoration: none; }
        @media (max-width: 600px) {
          .container { margin: 0; }
          .content { padding: 20px; }
          .header { padding: 30px 20px; }
          .detail-row { flex-direction: column; gap: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ تم تأكيد طلبك</h1>
          <p>متجرنا - منتجات مميزة</p>
        </div>
        
        <div class="content">
          <div class="order-section">
            <h2>شكراً لك ${userName}!</h2>
            <p>تم استلام طلبك بنجاح وسيتم معالجته في أقرب وقت ممكن. سنتواصل معك قريباً لتأكيد التفاصيل النهائية.</p>
          </div>
          
          <div class="order-details">
            <h3>📋 تفاصيل الطلب</h3>
            <div class="detail-row">
              <span class="detail-label">رقم الطلب:</span>
              <span class="detail-value">#${orderDetails.orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">تاريخ الطلب:</span>
              <span class="detail-value">${orderDetails.orderDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">المبلغ الإجمالي:</span>
              <span class="detail-value">${orderDetails.totalAmount} د.أ</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">حالة الطلب:</span>
              <span class="detail-value">${orderDetails.status}</span>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>متجرنا</strong></p>
          <p>مشغولات يدوية وكروشيه أصيلة منذ 2019</p>
          <p>📍 القاهرة، مصر | 🌍 نشحن لكل الدول</p>
          <p>
            <a href="${process.env.FRONTEND_URL || 'https://almasya.com'}/contact">تواصل معنا</a> | 
            <a href="${process.env.FRONTEND_URL || 'https://almasya.com'}/about">من نحن</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};
