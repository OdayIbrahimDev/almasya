import { Router } from "express";
import Subscriber from "../models/Subscriber.js";
import authMiddleware from "../middleware/authMiddleware.js";
import transporter from "../utils/mail.js";
import emailService from "../utils/emailService.js";

const router = Router();

router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body || {};
    const isValid = typeof email === "string" && /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
    if (!isValid) {
      return res.status(400).json({ message: "بريد غير صالح" });
    }
    const normalized = String(email).toLowerCase();
    const existing = await Subscriber.findOne({ email: normalized });
    if (existing) {
      return res.json({ message: "مشترك بالفعل" });
    }
    await Subscriber.create({ email: normalized });
    return res.json({ message: "تم الاشتراك" });
  } catch (e) {
    console.error("Subscribe error:", e);
    return res.status(500).json({ message: "خطأ في الاشتراك" });
  }
});

// Admin: list subscribers
router.get("/subscribers", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "ممنوع" });
    const subs = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subs);
  } catch (e) {
    console.error("List subscribers error:", e);
    res.status(500).json({ message: "خطأ في الجلب" });
  }
});

// Admin: send newsletter to all subscribers
router.post("/send", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "ممنوع" });
    const { subject, html } = req.body || {};
    if (!subject || !html) return res.status(400).json({ message: "الموضوع والمحتوى مطلوبان" });

    const subs = await Subscriber.find().select("email -_id");
    const emails = subs.map(s => s.email);
    if (!emails.length) return res.status(400).json({ message: "لا يوجد مشتركون" });

    // Use the new email service with beautiful template
    const result = await emailService.sendNewsletterEmail(subject, html, emails);
    
    if (result.success) {
      console.log("Newsletter sent successfully:", result.messageId);
      res.json({ message: "تم الإرسال", count: result.count });
    } else {
      console.error("Newsletter send failed:", result.error);
      res.status(500).json({ message: "خطأ في الإرسال" });
    }
  } catch (e) {
    console.error("Send newsletter error:", e);
    res.status(500).json({ message: "خطأ في الإرسال" });
  }
});

export default router;


