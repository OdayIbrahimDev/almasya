import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Review from "../models/Review.js";
import Products from "../models/Products.js";

const router = express.Router();

// List reviews by product
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (e) {
    console.error("List reviews error:", e);
    res.status(500).json({ message: "خطأ في جلب التقييمات" });
  }
});

// Create or update my review for a product
router.post("/product/:productId", authMiddleware, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "تقييم غير صالح" });
    if (!comment) return res.status(400).json({ message: "التعليق مطلوب" });

    const product = await Products.findById(req.params.productId).select("_id");
    if (!product) return res.status(404).json({ message: "المنتج غير موجود" });

    const review = await Review.findOneAndUpdate(
      { product: req.params.productId, user: req.user.userId },
      { $set: { rating, comment } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // compute aggregates
    const agg = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: "$product", averageRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }
    ]);

    const averageRating = agg[0]?.averageRating || 0;
    const totalReviews = agg[0]?.totalReviews || 0;
    await Products.findByIdAndUpdate(product._id, { averageRating, totalReviews });

    res.status(201).json({ review, averageRating, totalReviews });
  } catch (e) {
    console.error("Create review error:", e);
    res.status(500).json({ message: "خطأ في إنشاء التقييم" });
  }
});

export default router;


