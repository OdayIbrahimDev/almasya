import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "../models/Users.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendResetCodeEmail } from "../utils/mail.js";
import emailService from "../utils/emailService.js";

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    console.log('🔐 Registration request received:', req.body);
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Validation failed - missing fields:', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    if (password.length < 6) {
      console.log('❌ Password too short:', password.length);
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists with email:', email);
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email);
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    console.log('✅ User does not exist, creating new user...');
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with 'user' role by default
    const user = new Users({
      name,
      email,
      password: hashedPassword,
      role: 'user' // All new users get 'user' role by default
    });

    await user.save();
    console.log('✅ User created successfully:', user._id);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const responseData = {
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        firstLetter: user.firstLetter
      }
    };

    console.log('✅ Registration successful, sending response:', responseData);
    
    // Send welcome email (don't wait for it to complete)
    emailService.sendWelcomeEmail(user.email, user.name)
      .then(result => {
        if (result.success) {
          console.log('✅ Welcome email sent successfully');
        } else {
          console.log('⚠️ Welcome email failed:', result.error);
        }
      })
      .catch(error => {
        console.log('⚠️ Welcome email error:', error);
      });
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "بيانات غير صحيحة" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "بيانات غير صحيحة" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "تم تسجيل الدخول بنجاح",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        firstLetter: user.firstLetter
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "خطأ في تسجيل الدخول" });
  }
});

// Get profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await Users.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "خطأ في جلب الملف الشخصي" });
  }
});

// Update profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await Users.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: "تم تحديث الملف الشخصي بنجاح",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        firstLetter: user.firstLetter
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "خطأ في تحديث الملف الشخصي" });
  }
});

// Forgot password - Generate and send 6-digit code via email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('🔍 Checking email existence:', email);
    
    // Check if user exists
    const user = await Users.findOne({ email });
    if (!user) {
      console.log('❌ Email not found in database:', email);
      return res.status(404).json({ message: 'البريد الإلكتروني غير مسجل في النظام' });
    }

    console.log('✅ Email found, generating reset code for user:', user.name);

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔐 Generated reset code:', resetCode);
    
    // Save code and expiry (1 hour)
    user.resetCode = resetCode;
    user.resetCodeExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();
    console.log('💾 Reset code saved to database');

    // Send email with reset code
    console.log('📧 Attempting to send email to:', email);
    // Send reset code via email using new beautiful template
    const emailResult = await emailService.sendPasswordResetEmail(email, user.name, resetCode);
    const emailSent = emailResult.success;
    
    if (emailSent) {
      console.log('✅ Reset code sent successfully to:', email);
      res.json({ 
        message: 'تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني',
        success: true 
      });
    } else {
      console.log('❌ Failed to send reset code email to:', email);
      // Clear the reset code since email failed
      user.resetCode = null;
      user.resetCodeExpires = null;
      await user.save();
      res.status(500).json({ message: 'فشل في إرسال رمز إعادة التعيين، يرجى المحاولة مرة أخرى' });
    }
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ message: 'خطأ في إرسال رمز إعادة التعيين' });
  }
});

// Reset password - Validate code and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { token: resetCode, password } = req.body;
    
    // Find user with valid reset code
    const user = await Users.findOne({ 
      resetCode: resetCode,
      resetCodeExpires: { $gt: new Date() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'رمز غير صالح أو منتهي الصلاحية' });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear reset code
    user.resetCode = null;
    user.resetCodeExpires = null;
    
    await user.save();
    
    console.log('✅ Password reset successfully for user:', user.email);
    res.json({ message: 'تم إعادة تعيين كلمة المرور بنجاح' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ message: 'خطأ في إعادة تعيين كلمة المرور' });
  }
});

export default router;
