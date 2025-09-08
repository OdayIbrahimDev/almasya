import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    source: { type: String, default: "footer" },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Subscriber = mongoose.models.Subscriber || mongoose.model("Subscriber", subscriberSchema);

export default Subscriber;


