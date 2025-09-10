import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import productsRoutes from "./routes/products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";
import offersRoutes from "./routes/offers.routes.js";
import couponsRoutes from "./routes/coupons.routes.js";
import contactRoutes from "./routes/contact.routes.js";

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'https://almasya.com', 'https://www.almasya.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'src', 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/offers", offersRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/contact", contactRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Store API is running", status: "OK" });
});

export default app;
