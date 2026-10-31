
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    amountPaise: {
      type: Number,
      required: true,
      min: 1
    },

    paymentMethod: {
      type: String,
      enum: ["CASH", "UPI", "CARD", "BANK_TRANSFER", "OTHER"],
      required: true
    },

    transactionReference: {
      type: String,
      trim: true,
      default: null
    },

    paymentDate: {
      type: Date,
      default: Date.now
    },

    status: {
      type: String,
      enum: ["SUCCESS"],
      default: "SUCCESS"
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

// Avoid duplicate external transaction references when supplied.
paymentSchema.index(
  { transactionReference: 1 },
  {
    unique: true,
    partialFilterExpression: {
      transactionReference: { $type: "string" }
    }
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
