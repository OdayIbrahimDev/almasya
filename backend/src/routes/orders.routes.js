import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Orders from "../models/orders.js";
import Products from "../models/Products.js";
import Currency from "../models/Currency.js";
import emailService from "../utils/emailService.js";

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// Create order (Cash on Delivery)
router.post("/", async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items, currencyId, shippingAddress, phone, notes, appliedCoupon, finalTotal } = req.body;
    
    // Debug logging
    console.log("Creating order with data:", {
      userId,
      itemsCount: items?.length,
      currencyId,
      phone,
      appliedCoupon,
      finalTotal
    });

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "الطلب فارغ" });
    }

    // Load products and prepare order items using trusted prices
    const productIds = items.map((i) => i.productId);
    const products = await Products.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res.status(400).json({ message: "بعض المنتجات غير موجودة" });
    }

    // Ensure currency (fallback to active currency if not provided)
    const currency = currencyId ? await Currency.findById(currencyId) : await Currency.findOne({ isActive: true });
    if (!currency) {
      return res.status(400).json({ message: "العملة غير صحيحة" });
    }

    // Validate contact and address
    if (!phone || typeof phone !== "string" || phone.trim().length < 6) {
      return res.status(400).json({ message: "رقم الجوال غير صالح" });
    }
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.state) {
      return res.status(400).json({ message: "العنوان غير مكتمل (الشارع والمنطقة مطلوبة)" });
    }

    // Build order items and calculate subtotal using current DB prices
    const orderItems = items.map((i) => {
      const product = products.find((p) => p._id.toString() === i.productId);
      const unitPrice = product.offerPrice ?? product.price;
      return {
        product: product._id,
        quantity: Math.max(1, Number(i.quantity || 1)),
        price: unitPrice,
      };
    });

    const subtotal = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
    
    // Calculate coupon discount
    let couponDiscount = 0;
    let appliedCouponData = null;
    
    if (appliedCoupon && appliedCoupon.discount > 0 && appliedCoupon.couponId) {
      couponDiscount = Number(appliedCoupon.discount) || 0;
      appliedCouponData = {
        couponId: appliedCoupon.couponId,
        code: appliedCoupon.code || '',
        discount: couponDiscount,
        type: appliedCoupon.type || 'fixed'
      };
    }
    
    // Use finalTotal from frontend or calculate it
    const calculatedFinalTotal = Number(finalTotal) || (subtotal - couponDiscount);
    
    // Fallback to original totalAmount for backward compatibility
    const totalAmount = subtotal;

    const order = new Orders({
      user: userId,
      products: orderItems,
      totalAmount, // Original total for backward compatibility
      subtotal,
      couponDiscount,
      finalTotal: calculatedFinalTotal,
      appliedCoupon: appliedCouponData,
      currency: currency._id,
      paymentMethod: "cash_on_delivery",
      paymentStatus: "pending",
      status: "pending",
      phone: phone.trim(),
      shippingAddress: shippingAddress,
      notes: notes || "",
    });

    await order.save();

    const created = await Orders.findById(order._id)
      .populate("user", "name email")
      .populate("products.product", "name image")
      .populate("currency", "symbol code");
    
    // Conditionally populate coupon if it exists
    if (created.appliedCoupon && created.appliedCoupon.couponId) {
      try {
        await created.populate("appliedCoupon.couponId", "code name");
      } catch (populateError) {
        console.warn("Failed to populate coupon:", populateError);
        // Continue without coupon population
      }
    }

    // Send order confirmation email (don't wait for it to complete)
    emailService.sendOrderConfirmationEmail(created.user.email, created.user.name, {
      orderId: created._id,
      orderDate: new Date(created.createdAt).toLocaleDateString('ar-EG'),
      totalAmount: created.finalTotal || created.totalAmount,
      status: 'في الانتظار'
    }).then(result => {
      if (result.success) {
        console.log('✅ Order confirmation email sent successfully');
      } else {
        console.log('⚠️ Order confirmation email failed:', result.error);
      }
    }).catch(error => {
      console.log('⚠️ Order confirmation email error:', error);
    });

    res.status(201).json({ message: "تم إنشاء الطلب بنجاح", order: created });
  } catch (error) {
    console.error("Create order error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: "خطأ في إنشاء الطلب",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Cancel my order (user)
router.post("/:orderId/cancel", async (req, res) => {
  try {
    const userId = req.user.userId;
    const { orderId } = req.params;

    const order = await Orders.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    // User can cancel only if not shipped/delivered/completed/cancelled
    const nonCancellable = ["shipped", "delivered", "completed", "cancelled"];
    if (nonCancellable.includes(order.status)) {
      return res.status(400).json({ message: "لا يمكن إلغاء هذا الطلب في حالته الحالية" });
    }

    order.status = "cancelled";
    await order.save();

    const populated = await Orders.findById(order._id)
      .populate("products.product", "name images")
      .populate("currency", "symbol code");

    res.json({ message: "تم إلغاء الطلب", order: populated });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "خطأ في إلغاء الطلب" });
  }
});

// Get my orders
router.get("/my", async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Orders.find({ user: userId })
      .populate("products.product", "name images")
      .populate("currency", "symbol code")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({ message: "خطأ في جلب الطلبات" });
  }
});

export default router;
