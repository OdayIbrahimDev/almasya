import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  priceSnapshot: { type: Number, required: true },
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true, unique: true },
  items: [cartItemSchema],
  currency: { type: mongoose.Schema.Types.ObjectId, ref: "Currency" },
  updatedAt: { type: Date, default: Date.now },
});

cartSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Cart", cartSchema);


