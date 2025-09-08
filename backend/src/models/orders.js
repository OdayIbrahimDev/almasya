import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  // Add coupon-related fields
  appliedCoupon: {
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupons"
    },
    code: String,
    discount: Number,
    type: {
      type: String,
      enum: ["percentage", "fixed"]
    }
  },
  subtotal: {
    type: Number,
    required: false
  },
  couponDiscount: {
    type: Number,
    default: 0
  },
  finalTotal: {
    type: Number,
    required: false
  },
  currency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Currency",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "completed", "cancelled"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    default: "cash_on_delivery"
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending"
  },
  phone: {
    type: String,
    required: [true, "رقم الجوال مطلوب"]
  },
  shippingAddress: {
    street: { type: String, required: [true, "الشارع مطلوب"] },
    state: { type: String, required: [true, "المنطقة مطلوبة"] },
    city: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "" }
  },
  
  deliveryDate: Date,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
orderSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Orders", orderSchema);
