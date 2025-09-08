import express from "express";
import Products from "../models/Products.js";
import Categories from "../models/Categories.js";
import Currency from "../models/Currency.js";

const router = express.Router();

// Get all products with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12, best } = req.query;
    let query = {};

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (best === 'true') {
      query.isBestSeller = true;
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await Products.countDocuments(query);

    // Get paginated products
    const products = await Products.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      data: products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "خطأ في جلب المنتجات" });
  }
});

// Get all categories (place before dynamic routes)
router.get("/categories/all", async (req, res) => {
  try {
    const categories = await Categories.find({ isActive: true }).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "خطأ في جلب الفئات" });
  }
});

// Get all currencies (place before dynamic routes)
router.get("/currencies/all", async (req, res) => {
  try {
    const currencies = await Currency.find({ isActive: true }).sort({ name: 1 });
    res.json(currencies);
  } catch (error) {
    console.error("Get currencies error:", error);
    res.status(500).json({ message: "خطأ في جلب العملات" });
  }
});

// Active currency for display (place before dynamic routes)
router.get("/active-currency", async (req, res) => {
  try {
    const active = await Currency.findOne({ isActive: true });
    res.json(active || null);
  } catch (e) {
    console.error("Active currency error:", e);
    res.status(500).json({ message: "خطأ في جلب العملة" });
  }
});

// Get single product (placed AFTER specific routes so it doesn't catch them)
router.get("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Products.findById(productId)
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }

    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "خطأ في جلب المنتج" });
  }
});

export default router;
