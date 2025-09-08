import dotenv from 'dotenv';
import { sendResetCodeEmail } from './src/utils/mail.js';

// Load environment variables
dotenv.config();

console.log('🧪 Testing email functionality...');
console.log('📧 Email configuration:');
console.log('   EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('   EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not set');

// Test email sending
const testEmail = async () => {
  try {
    console.log('\n📧 Attempting to send test email...');
    const result = await sendResetCodeEmail(
      'test@example.com',
      '123456',
      'Test User'
    );
    
    if (result) {
      console.log('✅ Email test successful!');
    } else {
      console.log('❌ Email test failed!');
    }
  } catch (error) {
    console.error('❌ Email test error:', error);
  }
};

testEmail();
