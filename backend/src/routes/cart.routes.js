import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Cart from "../models/Cart.js";
import Products from "../models/Products.js";

const router = express.Router();

router.use(authMiddleware);

// Get my cart
router.get("/", async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate({
      path: "items.product",
      select: "name images price offerPrice currency category"
    });
    res.json(cart || { user: req.user.userId, items: [] });
  } catch (e) {
    console.error("Get cart error:", e);
    res.status(500).json({ message: "خطأ في جلب السلة" });
  }
});

// Add item to cart
router.post("/add", async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Products.findById(productId).select("price");
    if (!product) return res.status(404).json({ message: "المنتج غير موجود" });

    const cart = await Cart.findOneAndUpdate(
      { user: req.user.userId, "items.product": { $ne: productId } },
      { $push: { items: { product: productId, quantity, priceSnapshot: product.price } } },
      { new: true }
    );

    if (!cart) {
      // item exists, just increment
      const updated = await Cart.findOneAndUpdate(
        { user: req.user.userId, "items.product": productId },
        { $inc: { "items.$.quantity": quantity } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return res.status(201).json(updated);
    }

    res.status(201).json(cart);
  } catch (e) {
    console.error("Add to cart error:", e);
    res.status(500).json({ message: "خطأ في إضافة المنتج للسلة" });
  }
});

// Update item quantity
router.put("/item/:productId", async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity <= 0) return res.status(400).json({ message: "الكمية غير صالحة" });

    const updated = await Cart.findOneAndUpdate(
      { user: req.user.userId, "items.product": req.params.productId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    );
    res.json(updated);
  } catch (e) {
    console.error("Update cart item error:", e);
    res.status(500).json({ message: "خطأ في تحديث السلة" });
  }
});

// Remove item
router.delete("/item/:productId", async (req, res) => {
  try {
    const updated = await Cart.findOneAndUpdate(
      { user: req.user.userId },
      { $pull: { items: { product: req.params.productId } } },
      { new: true }
    );
    res.json(updated);
  } catch (e) {
    console.error("Remove cart item error:", e);
    res.status(500).json({ message: "خطأ في إزالة المنتج من السلة" });
  }
});

// Clear cart
router.delete("/clear", async (req, res) => {
  try {
    const updated = await Cart.findOneAndUpdate(
      { user: req.user.userId },
      { $set: { items: [] } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(updated);
  } catch (e) {
    console.error("Clear cart error:", e);
    res.status(500).json({ message: "خطأ في مسح السلة" });
  }
});

export default router;


