# Email Configuration for Password Reset

## Setup Instructions

### 1. Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/store

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (for password reset)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=5000
NODE_ENV=development
```

### 2. Gmail Setup (Recommended)

1. **Enable 2-Step Verification** on your Google Account
2. **Generate an App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter your store name
   - Copy the generated 16-character password
3. **Use the App Password** in your `.env` file:
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASS`: The 16-character app password (not your regular password)

### 3. Alternative Email Services

You can use other email services by modifying the transporter configuration in `src/utils/mail.js`:

```javascript
// For Outlook/Hotmail
const transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// For custom SMTP
const transporter = nodemailer.createTransporter({
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

### 4. Development Mode

If email is not configured, the system will:
- Log the reset code to the console
- Continue working normally
- Show success messages to users

This allows development without email setup.

### 5. Testing

1. Start the backend server
2. Go to the forgot password page
3. Enter an email address
4. Check the console for the reset code (in development mode)
5. Use the code to reset the password

## Security Notes

- Never commit your `.env` file to version control
- Use app passwords, not regular passwords
- The reset code expires after 1 hour
- Each code can only be used once






