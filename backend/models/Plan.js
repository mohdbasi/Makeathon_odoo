
import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"]
    },

    name: {
      type: String,
      required: [true, "Plan name is required"],
      trim: true
    },

    description: {
      type: String,
      trim: true,
      default: ""
    },

    price: {
      type: Number,
      required: [true, "Plan price is required"],
      min: [0, "Price cannot be negative"]
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true,
      trim: true
    },

    billingCycle: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "yearly"],
      required: [true, "Billing cycle is required"]
    },

    trialDays: {
      type: Number,
      default: 0,
      min: [0, "Trial days cannot be negative"]
    },

    setupFee: {
      type: Number,
      default: 0,
      min: [0, "Setup fee cannot be negative"]
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
