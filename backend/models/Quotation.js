
import mongoose from "mongoose";

const quotationItemSchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },

    setupFee: {
      type: Number,
      default: 0,
      min: 0
    },

    discount: {
      type: Number,
      default: 0,
      min: 0
    },

    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true
    },

    items: {
      type: [quotationItemSchema],
      validate: {
        validator: items => items.length > 0,
        message: "Quotation must contain at least one item"
      }
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    discount: {
      type: Number,
      default: 0,
      min: 0
    },

    tax: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true
    },

    validUntil: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected", "expired"],
      default: "draft"
    },

    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

const Quotation = mongoose.model("Quotation", quotationSchema);

export default Quotation;
