import express from "express";
import Coupon from "../models/Coupon.js";
import Products from "../models/Products.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all coupons (admin only)
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const coupons = await Coupon.find()
      .populate("category", "name")
      .populate("products", "name price")
      .sort({ createdAt: -1 });

    res.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get active coupons for public use
router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [{ endDate: { $gt: now } }, { endDate: null }]
    }).populate("category", "name");

    res.json(coupons);
  } catch (error) {
    console.error("Error fetching active coupons:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Test endpoint
router.post("/test", async (req, res) => {
  res.json({ message: "Coupon test endpoint working", body: req.body });
});

// Validate coupon code (public use)
router.post("/validate", async (req, res) => {
  try {
    console.log('Coupon validation request received:', req.body);
    
    // Handle potential JSON parsing issues
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ message: "Invalid JSON format" });
      }
    }
    
    const { code, orderAmount } = body;
    let { productIds } = body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findValidByCode(code);
    if (!coupon) {
      return res.status(404).json({ message: "Invalid or expired coupon code" });
    }

    // Check minimum order amount
    if (orderAmount && orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount required: ${coupon.minOrderAmount} د.أ`,
        minOrderAmount: coupon.minOrderAmount
      });
    }

    // Check if products have offers (prevent double discounts)
    if (productIds && productIds.length > 0) {
      const productsWithOffers = await Products.find({
        _id: { $in: productIds },
        offerPrice: { $exists: true, $ne: null }
      });

      if (productsWithOffers.length > 0) {
        // Instead of blocking completely, filter out products with offers
        const productsWithoutOffers = productIds.filter(id => 
          !productsWithOffers.find(p => p._id.toString() === id)
        );
        
        if (productsWithoutOffers.length === 0) {
          // All products have offers, cannot apply coupon
          const productNames = productsWithOffers.map(p => p.name).join(", ");
          return res.status(400).json({ 
            message: `Cannot apply coupon - all products have existing offers: ${productNames}`,
            productsWithOffers: productsWithOffers.map(p => ({ id: p._id, name: p.name }))
          });
        }
        
        // Update productIds to only include products without offers
        productIds = productsWithoutOffers;
        
        // Add warning about products with offers
        const productNames = productsWithOffers.map(p => p.name).join(", ");
        console.log(`Coupon will apply to products without offers. Products with offers (${productNames}) will be excluded from coupon discount.`);
      }
    }

    // Check if coupon can be applied to these products
    if (!coupon.canApplyToProducts(productIds || [])) {
      return res.status(400).json({ 
        message: "Coupon cannot be applied to the selected products" 
      });
    }

    // Calculate discount based on total order amount, not individual products
    let discount = 0;
    
    if (coupon.type === 'percentage') {
      // For percentage coupons, calculate based on total order amount
      discount = (orderAmount * coupon.value) / 100;
      
      // Apply max discount limit if set
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      // For fixed amount coupons
      discount = coupon.value;
    }
    
    // Ensure discount doesn't exceed order amount
    if (discount > orderAmount) {
      discount = orderAmount;
    }

    // Get products info for response
    let applicableProducts = [];
    if (productIds && productIds.length > 0) {
      applicableProducts = await Products.find({ _id: { $in: productIds } }).select('name price');
    }

    res.json({
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        name: coupon.name,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount
      },
      discount,
      isValid: true,
      applicableProducts: applicableProducts.map(p => ({ id: p._id, name: p.name, price: p.price })),
      message: applicableProducts.length < (req.body.productIds?.length || 0) 
        ? `Coupon applied to products without existing offers. Total discount: ${discount.toLocaleString('ar-EG')} د.أ` 
        : `Coupon applied successfully. Total discount: ${discount.toLocaleString('ar-EG')} د.أ`
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      message: "Internal server error during coupon validation",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create new coupon (admin only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { 
      code, name, description, type, value, minOrderAmount, maxDiscount, 
      usageLimit, scope, category, products, startDate, endDate 
    } = req.body;

    // Validate required fields
    if (!code || !name || !type || value === undefined) {
      return res.status(400).json({ message: "Code, name, type, and value are required" });
    }

    // Validate value based on type
    if (type === "percentage" && (value < 1 || value > 100)) {
      return res.status(400).json({ message: "Percentage value must be between 1 and 100" });
    }

    if (type === "fixed" && value < 0) {
      return res.status(400).json({ message: "Fixed value cannot be negative" });
    }

    // Validate scope-specific requirements
    if (scope === "category" && !category) {
      return res.status(400).json({ message: "Category is required when scope is 'category'" });
    }

    if (scope === "products" && (!products || products.length === 0)) {
      return res.status(400).json({ message: "Products are required when scope is 'products'" });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    // Create the coupon
    const coupon = new Coupon({
      code: code.toUpperCase(),
      name,
      description,
      type,
      value,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || null,
      scope,
      category: scope === "category" ? category : undefined,
      products: scope === "products" ? products : undefined,
      startDate: startDate || new Date(),
      endDate: endDate || null
    });

    await coupon.save();

    res.status(201).json(coupon);
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update coupon (admin only)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { 
      code, name, description, type, value, minOrderAmount, maxDiscount, 
      usageLimit, scope, category, products, startDate, endDate, isActive 
    } = req.body;

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Check if new code conflicts with existing coupon
    if (code && code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
      if (existingCoupon) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }
    }

    // Update coupon
    if (code) coupon.code = code.toUpperCase();
    if (name) coupon.name = name;
    if (description !== undefined) coupon.description = description;
    if (type) coupon.type = type;
    if (value !== undefined) coupon.value = value;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (scope) coupon.scope = scope;
    if (category !== undefined) coupon.category = scope === "category" ? category : undefined;
    if (products !== undefined) coupon.products = scope === "products" ? products : undefined;
    if (startDate) coupon.startDate = startDate;
    if (endDate !== undefined) coupon.endDate = endDate;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.json(coupon);
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete coupon (admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Toggle coupon status (admin only)
router.patch("/:id/toggle", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json(coupon);
  } catch (error) {
    console.error("Error toggling coupon:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Apply coupon to order (increment usage)
router.post("/:id/apply", async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ message: "Coupon is not valid" });
    }

    await coupon.incrementUsage();

    res.json({ message: "Coupon applied successfully", usedCount: coupon.usedCount + 1 });
  } catch (error) {
    console.error("Error applying coupon:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
