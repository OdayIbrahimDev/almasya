import mongoose from "mongoose";

const currencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "اسم العملة مطلوب"],
    unique: true
  },
  symbol: {
    type: String,
    required: [true, "رمز العملة مطلوب"],
    unique: true
  },
  code: {
    type: String,
    unique: true,
    default: ""
  },
  exchangeRate: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Currency", currencySchema);
