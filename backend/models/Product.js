
import mongoose from "mongoose";

// Product variant schema
const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Variant name is required"],
    trim: true
  },

  price: {
    type: Number,
    required: [true, "Variant price is required"],
    min: [0, "Price cannot be negative"]
  },

  description: {
    type: String,
    trim: true,
    default: ""
  }
});

// Main product schema
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true
    },

    variants: {
      type: [variantSchema],
      validate: {
        validator: function (variants) {
          return variants.length > 0;
        },
        message: "A product must have at least one variant"
      }
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
