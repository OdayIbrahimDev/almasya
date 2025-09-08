import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "الاسم مطلوب"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "البريد الإلكتروني مطلوب"],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, "كلمة المرور مطلوبة"],
    minlength: 6
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetCode: {
    type: String,
    default: null
  },
  resetCodeExpires: {
    type: Date,
    default: null
  }
});

// Virtual for getting first letter of name
userSchema.virtual("firstLetter").get(function() {
  return this.name ? this.name.charAt(0).toUpperCase() : "U";
});

// Ensure virtual fields are serialized
userSchema.set("toJSON", { virtuals: true });

export default mongoose.model("Users", userSchema);
