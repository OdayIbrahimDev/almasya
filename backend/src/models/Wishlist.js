import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Products",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

export default mongoose.model("Wishlist", wishlistSchema);


