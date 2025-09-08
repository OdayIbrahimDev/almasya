import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import authMiddleware from "../middleware/authMiddleware.js";
import Products from "../models/Products.js";
import Orders from "../models/orders.js";
import Users from "../models/Users.js";
import Currency from "../models/Currency.js";
import Categories from "../models/Categories.js";
import Offer from "../models/Offer.js";

const router = express.Router();

// Multer storage for images (products, categories)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Save uploads into backend src/uploads so they are served at /uploads by Express static
const uploadsDir = path.join(process.cwd(), 'src', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    // Prefix based on route intent
    const isCategory = req.originalUrl.includes('/categories');
    const prefix = isCategory ? 'category' : 'product';
    cb(null, `${prefix}-${unique}${ext}`);
  }
});

const upload = multer({ storage });

// Apply both middlewares
router.use(authMiddleware, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "الوصول مرفوض - مطلوب صلاحيات المدير" });
  }
  next();
});

// Get all orders with status filtering
router.get("/orders", async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status) {
      query.status = status;
    }

    const orders = await Orders.find(query)
      .populate("user", "name email")
      .populate("products.product", "name image")
      .populate("currency", "symbol code")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "خطأ في جلب الطلبات" });
  }
});

// Update order status
router.put("/orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Orders.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "الطلب غير موجود" });
    }

    res.json({ message: "تم تحديث حالة الطلب بنجاح", order });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "خطأ في تحديث حالة الطلب" });
  }
});

// Get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Products.find()
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "خطأ في جلب المنتجات" });
  }
});

// Create product
router.post("/products", upload.single('image'), async (req, res) => {
  try {
    const body = req.body;
    if (!body.name || !body.description || !body.price || !body.category) {
      return res.status(400).json({ message: "الرجاء تعبئة الاسم والوصف والسعر والفئة" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "صورة المنتج مطلوبة" });
    }
    const payload = {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      offerPrice: body.offerPrice ? Number(body.offerPrice) : undefined,
      category: body.category,
      inStock: body.inStock !== 'false' && body.inStock !== false,
      image: ''
    };
    const relativePath = `/uploads/${path.basename(req.file.path)}`;
    payload.image = relativePath;

    const product = new Products(payload);
    await product.save();
    
    const populatedProduct = await Products.findById(product._id)
      .populate("category", "name");

    res.status(201).json({
      message: "تم إنشاء المنتج بنجاح",
      product: populatedProduct
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "خطأ في إنشاء المنتج" });
  }
});

// Update product
router.put("/products/:productId", upload.single('image'), async (req, res) => {
  try {
    const { productId } = req.params;
    const body = req.body;
    const update = {
      name: body.name,
      description: body.description,
      price: body.price !== undefined ? Number(body.price) : undefined,
      offerPrice: body.offerPrice ? Number(body.offerPrice) : undefined,
      category: body.category,
      inStock: body.inStock !== undefined ? (body.inStock === 'false' ? false : Boolean(body.inStock)) : undefined,
      ...(body.isBestSeller !== undefined ? { isBestSeller: body.isBestSeller === 'true' || body.isBestSeller === true } : {}),
    };
    if (req.file) {
      const relativePath = `/uploads/${path.basename(req.file.path)}`;
      update.image = relativePath;
    }
    Object.keys(update).forEach((k) => {
      if (update[k] === undefined) {
        delete update[k];
      }
    });

    const product = await Products.findByIdAndUpdate(productId, update, { new: true })
      .populate("category", "name");

    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }

    res.json({
      message: "تم تحديث المنتج بنجاح",
      product
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "خطأ في تحديث المنتج" });
  }
});

// Delete product
router.delete("/products/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Products.findByIdAndDelete(productId);

    if (!product) {
      return res.status(404).json({ message: "المنتج غير موجود" });
    }

    res.json({ message: "تم حذف المنتج بنجاح" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "خطأ في حذف المنتج" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await Users.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "خطأ في جلب المستخدمين" });
  }
});

// Update user role
router.put("/users/:userId/role", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const user = await Users.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    res.json({
      message: "تم تحديث دور المستخدم بنجاح",
      user
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "خطأ في تحديث دور المستخدم" });
  }
});

// Update user (general update for role and isActive)
router.put("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, isActive } = req.body;

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await Users.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    res.json({
      message: "تم تحديث المستخدم بنجاح",
      user
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "خطأ في تحديث المستخدم" });
  }
});

// Create new user
router.post("/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    // Check if user already exists
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "البريد الإلكتروني مستخدم من قبل" });
    }

    const user = new Users({
      name,
      email,
      password,
      role,
      isActive: true
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "تم إنشاء المستخدم بنجاح",
      user: userResponse
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "خطأ في إنشاء المستخدم" });
  }
});

// Delete user
router.delete("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await Users.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    res.json({
      message: "تم حذف المستخدم بنجاح"
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "خطأ في حذف المستخدم" });
  }
});

// Get all currencies
router.get("/currencies", async (req, res) => {
  try {
    const currencies = await Currency.find().sort({ createdAt: -1 });
    res.json(currencies);
  } catch (error) {
    console.error("Get currencies error:", error);
    res.status(500).json({ message: "خطأ في جلب العملات" });
  }
});

// Create currency
router.post("/currencies", async (req, res) => {
  try {
    const { name, symbol, code = "", exchangeRate = 1 } = req.body;
    if (!name || !symbol) {
      return res.status(400).json({ message: "الاسم والرمز مطلوبان" });
    }
    const codeSafe = String(code || '').trim() || `C${Date.now()}`;
    const currency = new Currency({
      name: String(name).trim(),
      symbol: String(symbol).trim(),
      code: codeSafe,
      exchangeRate: Number(exchangeRate) || 1
    });
    await currency.save();
    
    res.status(201).json({
      message: "تم إنشاء العملة بنجاح",
      currency
    });
  } catch (error) {
    console.error("Create currency error:", error);
    if (error && error.code === 11000) {
      const which = error?.keyPattern ? Object.keys(error.keyPattern).join(", ") : undefined;
      const val = error?.keyValue ? JSON.stringify(error.keyValue) : undefined;
      return res.status(400).json({ message: "اسم أو رمز العملة مستخدم من قبل", field: which, value: val });
    }
    res.status(500).json({ message: "خطأ في إنشاء العملة" });
  }
});

// Update currency
router.put("/currencies/:currencyId", async (req, res) => {
  try {
    const { currencyId } = req.params;
    const update = {
      ...(req.body.name !== undefined ? { name: String(req.body.name).trim() } : {}),
      ...(req.body.symbol !== undefined ? { symbol: String(req.body.symbol).trim() } : {}),
      ...(req.body.code !== undefined ? { code: String(req.body.code).trim() } : {}),
      ...(req.body.exchangeRate !== undefined ? { exchangeRate: Number(req.body.exchangeRate) || 1 } : {})
    };
    const currency = await Currency.findByIdAndUpdate(currencyId, update, { new: true });

    if (!currency) {
      return res.status(404).json({ message: "العملة غير موجودة" });
    }

    res.json({
      message: "تم تحديث العملة بنجاح",
      currency
    });
  } catch (error) {
    console.error("Update currency error:", error);
    if (error && error.code === 11000) {
      return res.status(400).json({ message: "اسم أو رمز العملة مستخدم من قبل" });
    }
    res.status(500).json({ message: "خطأ في تحديث العملة" });
  }
});

// Delete currency
router.delete("/currencies/:currencyId", async (req, res) => {
  try {
    const { currencyId } = req.params;
    const currency = await Currency.findByIdAndDelete(currencyId);

    if (!currency) {
      return res.status(404).json({ message: "العملة غير موجودة" });
    }

    res.json({ message: "تم حذف العملة بنجاح" });
  } catch (error) {
    console.error("Delete currency error:", error);
    res.status(500).json({ message: "خطأ في حذف العملة" });
  }
});

// Activate currency (set as default for all products display)
router.put("/currencies/:currencyId/activate", async (req, res) => {
  try {
    const { currencyId } = req.params;
    const target = await Currency.findById(currencyId);
    if (!target) return res.status(404).json({ message: "العملة غير موجودة" });
    await Currency.updateMany({}, { $set: { isActive: false } });
    target.isActive = true;
    await target.save();
    res.json({ message: "تم تفعيل العملة الافتراضية", currency: target });
  } catch (error) {
    console.error("Activate currency error:", error);
    res.status(500).json({ message: "خطأ في تفعيل العملة" });
  }
});

// Get all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Categories.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "خطأ في جلب الفئات" });
  }
});

// Create category (supports image upload)
router.post("/categories", upload.single('image'), async (req, res) => {
  try {
    const body = req.body;
    const payload = {
      name: body.name,
      description: body.description,
    };
    if (req.file) {
      payload.image = `/uploads/${path.basename(req.file.path)}`;
    }
    const category = new Categories(payload);
    await category.save();
    
    res.status(201).json({
      message: "تم إنشاء الفئة بنجاح",
      category
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "خطأ في إنشاء الفئة" });
  }
});

// Update category (supports image upload)
router.put("/categories/:categoryId", upload.single('image'), async (req, res) => {
  try {
    const { categoryId } = req.params;
    const body = req.body;
    const update = {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
    };
    if (req.file) {
      update.image = `/uploads/${path.basename(req.file.path)}`;
    }
    const category = await Categories.findByIdAndUpdate(categoryId, update, { new: true });

    if (!category) {
      return res.status(404).json({ message: "الفئة غير موجودة" });
    }

    res.json({
      message: "تم تحديث الفئة بنجاح",
      category
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "خطأ في تحديث الفئة" });
  }
});

// Delete category
router.delete("/categories/:categoryId", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Categories.findByIdAndDelete(categoryId);

    if (!category) {
      return res.status(404).json({ message: "الفئة غير موجودة" });
    }

    res.json({ message: "تم حذف الفئة بنجاح" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "خطأ في حذف الفئة" });
  }
});

export default router;
 
// Offers: create and apply percentage discount
router.post("/offers", async (req, res) => {
  try {
    const { name, percentage, scope, category, products } = req.body;
    const offer = new Offer({ name, percentage, scope, category, products });
    await offer.save();

    // Apply to products
    let match = {};
    if (scope === 'all') {
      match = {};
    } else if (scope === 'category' && category) {
      match = { category };
    } else if (scope === 'products' && Array.isArray(products)) {
      match = { _id: { $in: products } };
    }

    const toUpdate = await Products.find(match).select('_id price');
    const bulk = toUpdate.map(p => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { offerPrice: Math.max(0, Math.round((p.price * (100 - percentage)))/100) } }
      }
    }));
    if (bulk.length) await Products.bulkWrite(bulk);

    res.status(201).json({ message: 'تم إنشاء العرض وتطبيق الخصم', offer });
  } catch (e) {
    console.error('Create offer error:', e);
    res.status(500).json({ message: 'خطأ في إنشاء العرض' });
  }
});

router.get("/offers", async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (e) {
    console.error('List offers error:', e);
    res.status(500).json({ message: 'خطأ في جلب العروض' });
  }
});

router.put("/offers/:offerId/toggle", async (req, res) => {
  try {
    const { offerId } = req.params;
    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: 'العرض غير موجود' });
    offer.isActive = !offer.isActive;
    await offer.save();
    res.json({ message: 'تم التحديث', offer });
  } catch (e) {
    console.error('Toggle offer error:', e);
    res.status(500).json({ message: 'خطأ في تحديث العرض' });
  }
});
