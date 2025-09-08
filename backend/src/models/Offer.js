import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  percentage: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 100 
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

// Add index for better query performance
offerSchema.index({ isActive: 1, scope: 1, category: 1 });
offerSchema.index({ isActive: 1, products: 1 });

// Method to calculate discount price
offerSchema.methods.calculateDiscountPrice = function(originalPrice) {
  if (!this.isActive) return originalPrice;
  
  const now = new Date();
  if (this.endDate && now > this.endDate) return originalPrice;
  if (this.startDate && now < this.startDate) return originalPrice;
  
  const discountAmount = (originalPrice * this.percentage) / 100;
  return Math.round((originalPrice - discountAmount) * 100) / 100; // Round to 2 decimal places
};

// Static method to get applicable offers for a product
offerSchema.statics.getApplicableOffers = async function(productId, categoryId) {
  const now = new Date();
  
  const offers = await this.find({
    isActive: true,
    $or: [
      { scope: "all" },
      { scope: "category", category: categoryId },
      { scope: "products", products: productId }
    ],
    $and: [
      { startDate: { $lte: now } },
      { $or: [{ endDate: { $gt: now } }, { endDate: null }] }
    ]
  }).sort({ percentage: -1 }); // Sort by highest discount first
  
  return offers;
};

export default mongoose.model("Offer", offerSchema);


