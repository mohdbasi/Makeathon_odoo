
import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    unitPricePaise: {
      type: Number,
      required: true,
      min: 0
    },

    taxRateBps: {
      type: Number,
      default: 0,
      min: 0,
      max: 10000
    }
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },

    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true
    },

    items: {
      type: [invoiceItemSchema],
      required: true,
      validate: {
        validator: items => items.length > 0,
        message: "An invoice must contain at least one item."
      }
    },

    subtotalPaise: {
      type: Number,
      required: true,
      min: 0
    },

    discountPaise: {
      type: Number,
      default: 0,
      min: 0
    },

    taxPaise: {
      type: Number,
      required: true,
      min: 0
    },

    totalPaise: {
      type: Number,
      required: true,
      min: 0
    },

    amountPaidPaise: {
      type: Number,
      default: 0,
      min: 0
    },

    status: {
      type: String,
      enum: ["UNPAID", "PARTIALLY_PAID", "PAID"],
      default: "UNPAID"
    },

    dueDate: {
      type: Date,
      required: true
    },

    notes: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

invoiceSchema.index({ customerId: 1, createdAt: -1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
