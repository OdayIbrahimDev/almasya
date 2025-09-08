import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscount: {
    type: Number,
    default: null
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  scope: {
    type: String,
    enum: ["all", "category", "products"],
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categories"
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products"
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add indexes for better query performance
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
couponSchema.index({ scope: 1, category: 1 });
couponSchema.index({ scope: 1, products: 1 });

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  
  if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
  
  return true;
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderAmount, productIds = []) {
  if (!this.isValid()) return 0;
  
  let discount = 0;
  
  if (this.type === "percentage") {
    discount = (orderAmount * this.value) / 100;
  } else {
    discount = this.value;
  }
  
  // Apply max discount limit if set
  if (this.maxDiscount && discount > this.maxDiscount) {
    discount = this.maxDiscount;
  }
  
  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Method to check if coupon can be applied to specific products
couponSchema.methods.canApplyToProducts = function(productIds) {
  if (!this.isValid()) return false;
  
  if (this.scope === "all") return true;
  
  if (this.scope === "category") {
    // Check if any of the products belong to the specified category
    // This will be implemented in the service layer
    return true;
  }
  
  if (this.scope === "products") {
    return productIds.some(id => this.products.includes(id));
  }
  
  return false;
};

// Method to increment usage count
couponSchema.methods.incrementUsage = async function() {
  this.usedCount += 1;
  await this.save();
};

// Static method to find valid coupon by code
couponSchema.statics.findValidByCode = async function(code) {
  const now = new Date();
  
  const coupon = await this.findOne({
    code: code.toUpperCase(),
    isActive: true,
    startDate: { $lte: now },
    $or: [{ endDate: { $gt: now } }, { endDate: null }]
  });
  
  if (!coupon) return null;
  
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return null;
  
  return coupon;
};

export default mongoose.model("Coupon", couponSchema);
