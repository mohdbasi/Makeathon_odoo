
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    subscriptionNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      required: true
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true
    },

    billingCycle: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "yearly"],
      required: true
    },

    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    currentPeriodStart: {
      type: Date,
      required: true
    },

    currentPeriodEnd: {
      type: Date,
      required: true
    },

    nextBillingDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      default: null
    },

    autoRenew: {
      type: Boolean,
      default: true
    },

    status: {
      type: String,
      enum: ["active", "paused", "cancelled", "expired"],
      default: "active"
    },

    pausedAt: {
      type: Date,
      default: null
    },

    cancelledAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const Subscription = mongoose.model(
  "Subscription",
  subscriptionSchema
);

export default Subscription;
