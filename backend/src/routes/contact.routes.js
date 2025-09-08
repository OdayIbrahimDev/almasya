import express from "express";
import Contact from "../models/Contact.js";
import emailService from "../utils/emailService.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Test route to check if Contact model is working
router.get("/test", async (req, res) => {
  try {
    console.log('📧 Testing Contact model...');
    const count = await Contact.countDocuments();
    console.log('📧 Contact count:', count);
    res.json({ message: "Contact model working", count });
  } catch (error) {
    console.error("Contact model test error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test route to create a sample contact
router.post("/test", async (req, res) => {
  try {
    console.log('📧 Creating test contact...');
    const testContact = new Contact({
      name: "Test User",
      email: "test@example.com",
      message: "This is a test message",
      phone: "01234567890",
      status: "unread"
    });
    
    await testContact.save();
    console.log('📧 Test contact created:', testContact._id);
    res.json({ message: "Test contact created", contact: testContact });
  } catch (error) {
    console.error("Test contact creation error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Submit contact form
router.post("/", async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        message: "يرجى إكمال جميع الحقول المطلوبة" 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "يرجى إدخال بريد إلكتروني صحيح" 
      });
    }

    // Create new contact message
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      phone: phone?.trim() || "",
      status: "unread", // unread, read, replied
      createdAt: new Date()
    });

    await contact.save();

    // Send notification email to admin (don't wait for it to complete)
    emailService.sendContactFormNotification({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: contact.message
    }).then(result => {
      if (result.success) {
        console.log('✅ Contact form notification sent to admin');
      } else {
        console.log('⚠️ Contact form notification failed:', result.error);
      }
    }).catch(error => {
      console.log('⚠️ Contact form notification error:', error);
    });

    res.status(201).json({ 
      message: "تم إرسال رسالتك بنجاح. سنعاود التواصل قريباً." 
    });

  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ 
      message: "حدث خطأ أثناء إرسال الرسالة. حاول مرة أخرى." 
    });
  }
});

// Get all contact messages (admin only)
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log('📧 Getting contacts, user role:', req.user?.role);
    
    if (req.user.role !== "admin") {
      console.log('❌ Access denied - not admin');
      return res.status(403).json({ message: "ممنوع" });
    }
    
    const contacts = await Contact.find()
      .sort({ createdAt: -1 });

    console.log('📧 Found contacts:', contacts.length);
    console.log('📧 Contacts data:', contacts);
    res.json(contacts);
  } catch (error) {
    console.error("Get contacts error:", error);
    res.status(500).json({ 
      message: "خطأ في جلب الرسائل" 
    });
  }
});

// Mark contact as read (admin only)
router.put("/:id/read", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "ممنوع" });
    }
    
    const { id } = req.params;
    
    const contact = await Contact.findByIdAndUpdate(
      id,
      { status: "read" },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "الرسالة غير موجودة" });
    }

    res.json({ message: "تم تحديث حالة الرسالة", contact });
  } catch (error) {
    console.error("Mark contact read error:", error);
    res.status(500).json({ 
      message: "خطأ في تحديث حالة الرسالة" 
    });
  }
});

// Mark contact as replied (admin only)
router.put("/:id/replied", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "ممنوع" });
    }
    
    const { id } = req.params;
    
    const contact = await Contact.findByIdAndUpdate(
      id,
      { status: "replied" },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ message: "الرسالة غير موجودة" });
    }

    res.json({ message: "تم تحديث حالة الرسالة", contact });
  } catch (error) {
    console.error("Mark contact replied error:", error);
    res.status(500).json({ 
      message: "خطأ في تحديث حالة الرسالة" 
    });
  }
});

export default router;
