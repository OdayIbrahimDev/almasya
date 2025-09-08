import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "اسم المنتج مطلوب"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "وصف المنتج مطلوب"]
  },
  price: {
    type: Number,
    required: [true, "السعر مطلوب"],
    min: 0
  },
  offerPrice: {
    type: Number,
    min: 0
  },
  // currency removed from product; global active currency will be used
  image: {
    type: String,
    required: [true, "صورة المنتج مطلوبة"]
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categories",
    required: true
  },
  averageRating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isBestSeller: {
    type: Boolean,
    default: false,
    index: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Products", productSchema);
