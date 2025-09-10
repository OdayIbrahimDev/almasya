# دليل نشر الموقع على الخادم

## المشاكل المحتملة في الإمارات:

### 1. مشاكل DNS
- تأكد من أن النطاق `almasya.com` مُعد بشكل صحيح
- استخدم DNS من مزود موثوق مثل Cloudflare
- تأكد من أن TTL منخفض (300 ثانية)

### 2. مشاكل CDN
- استخدم Cloudflare أو AWS CloudFront
- فعّل HTTP/2 و HTTP/3
- فعّل ضغط Gzip

### 3. مشاكل SSL
- تأكد من أن شهادة SSL صالحة
- استخدم Let's Encrypt أو شهادة مدفوعة

### 4. إعدادات الخادم
- تأكد من أن الخادم يستمع على جميع الواجهات (0.0.0.0)
- تأكد من أن الجدار الناري يسمح بالاتصالات على المنافذ 80 و 443

## خطوات النشر:

### 1. إعداد الخادم
```bash
# تثبيت Node.js و PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# تثبيت Nginx
sudo apt update
sudo apt install nginx

# تثبيت MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

### 2. رفع الملفات
```bash
# رفع الملفات إلى الخادم
scp -r . user@server:/var/www/almasya
```

### 3. إعداد Nginx
```bash
# نسخ تكوين Nginx
sudo cp nginx.conf /etc/nginx/sites-available/almasya
sudo ln -s /etc/nginx/sites-available/almasya /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. تشغيل التطبيق
```bash
# تشغيل السكريبت
chmod +x start-server.sh
./start-server.sh
```

### 5. إعداد SSL
```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx

# الحصول على شهادة SSL
sudo certbot --nginx -d almasya.com -d www.almasya.com
```

## فحص المشاكل:

### 1. فحص DNS
```bash
nslookup almasya.com
dig almasya.com
```

### 2. فحص الاتصال
```bash
curl -I https://almasya.com
curl -I https://almasya.com/api/health
```

### 3. فحص Nginx
```bash
sudo nginx -t
sudo systemctl status nginx
```

### 4. فحص PM2
```bash
pm2 status
pm2 logs
```

## نصائح إضافية:

1. **استخدم Cloudflare** لتحسين الأداء والأمان
2. **فعّل ضغط الصور** لتقليل حجم البيانات
3. **استخدم قاعدة بيانات محلية** أو MongoDB Atlas
4. **راقب الأداء** باستخدام PM2 Monitor
5. **احتفظ بنسخ احتياطية** منتظمة
