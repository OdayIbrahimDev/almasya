import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Wishlist from "../models/Wishlist.js";

const router = express.Router();

router.use(authMiddleware);

// Get my wishlist
router.get("/", async (req, res) => {
  try {
    const items = await Wishlist.find({ user: req.user.userId })
      .populate({
        path: "product",
        select: "name image price offerPrice category",
        populate: { path: "category", select: "name" }
      })
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (e) {
    console.error("Get wishlist error:", e);
    res.status(500).json({ message: "خطأ في جلب المفضلة" });
  }
});

// Add to wishlist
router.post("/:productId", async (req, res) => {
  try {
    const doc = await Wishlist.findOneAndUpdate(
      { user: req.user.userId, product: req.params.productId },
      { $setOnInsert: { user: req.user.userId, product: req.params.productId } },
      { upsert: true, new: true }
    );
    res.status(201).json(doc);
  } catch (e) {
    console.error("Add wishlist error:", e);
    res.status(500).json({ message: "خطأ في إضافة المنتج للمفضلة" });
  }
});

// Remove from wishlist
router.delete("/:productId", async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ user: req.user.userId, product: req.params.productId });
    res.json({ message: "تم الإزالة من المفضلة" });
  } catch (e) {
    console.error("Remove wishlist error:", e);
    res.status(500).json({ message: "خطأ في إزالة المنتج من المفضلة" });
  }
});

export default router;


