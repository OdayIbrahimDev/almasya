import express from "express";
import Offer from "../models/Offer.js";
import Products from "../models/Products.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all offers (admin only)
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const offers = await Offer.find()
      .populate("category", "name")
      .populate("products", "name price")
      .sort({ createdAt: -1 });

    res.json(offers);
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get active offers for public use
router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [{ endDate: { $gt: now } }, { endDate: null }]
    }).populate("category", "name");

    res.json(offers);
  } catch (error) {
    console.error("Error fetching active offers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new offer (admin only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { name, percentage, scope, category, products, startDate, endDate } = req.body;

    // Validate required fields
    if (!name || !percentage || !scope) {
      return res.status(400).json({ message: "Name, percentage, and scope are required" });
    }

    // Validate percentage range
    if (percentage < 1 || percentage > 100) {
      return res.status(400).json({ message: "Percentage must be between 1 and 100" });
    }

    // Validate scope-specific requirements
    if (scope === "category" && !category) {
      return res.status(400).json({ message: "Category is required when scope is 'category'" });
    }

    if (scope === "products" && (!products || products.length === 0)) {
      return res.status(400).json({ message: "Products are required when scope is 'products'" });
    }

    // Create the offer
    const offer = new Offer({
      name,
      percentage,
      scope,
      category: scope === "category" ? category : undefined,
      products: scope === "products" ? products : undefined,
      startDate: startDate || new Date(),
      endDate: endDate || null
    });

    await offer.save();

    // Update products with offer prices if scope is "all" or "category"
    if (scope === "all" || scope === "category") {
      await updateProductOfferPrices(offer);
    } else if (scope === "products") {
      await updateSpecificProductOfferPrices(offer);
    }

    res.status(201).json(offer);
  } catch (error) {
    console.error("Error creating offer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update offer (admin only)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const { name, percentage, scope, category, products, startDate, endDate, isActive } = req.body;

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Store old scope for cleanup
    const oldScope = offer.scope;
    const oldCategory = offer.category;
    const oldProducts = offer.products;

    // Update offer
    offer.name = name || offer.name;
    offer.percentage = percentage || offer.percentage;
    offer.scope = scope || offer.scope;
    offer.category = scope === "category" ? category : undefined;
    offer.products = scope === "products" ? products : undefined;
    offer.startDate = startDate || offer.startDate;
    offer.endDate = endDate || offer.endDate;
    offer.isActive = isActive !== undefined ? isActive : offer.isActive;

    await offer.save();

    // Clean up old offer prices and apply new ones
    await cleanupOldOfferPrices(oldScope, oldCategory, oldProducts);
    
    if (offer.isActive) {
      if (offer.scope === "all" || offer.scope === "category") {
        await updateProductOfferPrices(offer);
      } else if (offer.scope === "products") {
        await updateSpecificProductOfferPrices(offer);
      }
    }

    res.json(offer);
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete offer (admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Clean up offer prices before deleting
    await cleanupOldOfferPrices(offer.scope, offer.category, offer.products);

    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: "Offer deleted successfully" });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Toggle offer status (admin only)
router.patch("/:id/toggle", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    offer.isActive = !offer.isActive;
    await offer.save();

    if (offer.isActive) {
      // Apply offer prices
      if (offer.scope === "all" || offer.scope === "category") {
        await updateProductOfferPrices(offer);
      } else if (offer.scope === "products") {
        await updateSpecificProductOfferPrices(offer);
      }
    } else {
      // Remove offer prices
      await cleanupOldOfferPrices(offer.scope, offer.category, offer.products);
    }

    res.json(offer);
  } catch (error) {
    console.error("Error toggling offer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Helper function to update product offer prices
async function updateProductOfferPrices(offer) {
  try {
    let query = {};
    
    if (offer.scope === "category" && offer.category) {
      query.category = offer.category;
    }

    const products = await Products.find(query);
    
    for (const product of products) {
      const discountPrice = offer.calculateDiscountPrice(product.price);
      if (discountPrice !== product.price) {
        product.offerPrice = discountPrice;
        await product.save();
      }
    }
  } catch (error) {
    console.error("Error updating product offer prices:", error);
  }
}

// Helper function to update specific product offer prices
async function updateSpecificProductOfferPrices(offer) {
  try {
    if (!offer.products || offer.products.length === 0) return;

    const products = await Products.find({ _id: { $in: offer.products } });
    
    for (const product of products) {
      const discountPrice = offer.calculateDiscountPrice(product.price);
      if (discountPrice !== product.price) {
        product.offerPrice = discountPrice;
        await product.save();
      }
    }
  } catch (error) {
    console.error("Error updating specific product offer prices:", error);
  }
}

// Helper function to cleanup old offer prices
async function cleanupOldOfferPrices(scope, category, products) {
  try {
    if (scope === "all") {
      // Reset all offer prices
      await Products.updateMany({}, { $unset: { offerPrice: 1 } });
    } else if (scope === "category" && category) {
      // Reset category offer prices
      await Products.updateMany({ category }, { $unset: { offerPrice: 1 } });
    } else if (scope === "products" && products && products.length > 0) {
      // Reset specific product offer prices
      await Products.updateMany({ _id: { $in: products } }, { $unset: { offerPrice: 1 } });
    }
  } catch (error) {
    console.error("Error cleaning up offer prices:", error);
  }
}

export default router;
