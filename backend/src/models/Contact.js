import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "الاسم مطلوب"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "البريد الإلكتروني مطلوب"],
    trim: true,
    lowercase: true
  },
  message: {
    type: String,
    required: [true, "الرسالة مطلوبة"],
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    default: ""
  },
  status: {
    type: String,
    enum: ["unread", "read", "replied"],
    default: "unread"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Contact", contactSchema);
