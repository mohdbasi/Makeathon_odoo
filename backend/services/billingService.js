
import { randomUUID } from "node:crypto";
import mongoose from "mongoose";

import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";

// Convert an invoice into a response-friendly object.
// OVERDUE is calculated dynamically; it does not overwrite the
// stored payment status.
export const formatInvoice = invoice => {
  const data = invoice.toObject
    ? invoice.toObject()
    : invoice;

  const outstandingPaise =
    data.totalPaise - data.amountPaidPaise;

  let displayStatus = data.status;

  if (
    outstandingPaise > 0 &&
    new Date(data.dueDate) < new Date()
  ) {
    displayStatus = "OVERDUE";
  }

  return {
    ...data,
    outstandingPaise,
    displayStatus
  };
};

// Calculate all invoice amounts on the backend.
export const calculateInvoice = (items, discountPaise = 0) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one invoice item is required.");
  }

  if (!Number.isSafeInteger(discountPaise) || discountPaise < 0) {
    throw new Error("Discount must be a non-negative whole number of paise.");
  }

  let subtotalPaise = 0;
  let taxPaise = 0;

  const calculatedItems = items.map(item => {
    const quantity = Number(item.quantity);
    const unitPricePaise = Number(item.unitPricePaise);
    const taxRateBps = Number(item.taxRateBps ?? 0);

    if (
      !item.description ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      !Number.isSafeInteger(unitPricePaise) ||
      unitPricePaise < 0 ||
      !Number.isSafeInteger(taxRateBps) ||
      taxRateBps < 0 ||
      taxRateBps > 10000
    ) {
      throw new Error("One or more invoice items contain invalid values.");
    }

    const lineSubtotal = quantity * unitPricePaise;

    if (!Number.isSafeInteger(lineSubtotal)) {
      throw new Error("Invoice item amount is too large.");
    }

    const lineTax = Math.round(
      (lineSubtotal * taxRateBps) / 10000
    );

    subtotalPaise += lineSubtotal;
    taxPaise += lineTax;

    return {
      description: item.description,
      quantity,
      unitPricePaise,
      taxRateBps
    };
  });

  if (
    !Number.isSafeInteger(subtotalPaise) ||
    !Number.isSafeInteger(taxPaise)
  ) {
    throw new Error("Invoice amount is too large.");
  }

  if (discountPaise > subtotalPaise + taxPaise) {
    throw new Error("Discount cannot exceed the invoice amount.");
  }

  const totalPaise =
    subtotalPaise + taxPaise - discountPaise;

  if (!Number.isSafeInteger(totalPaise) || totalPaise <= 0) {
    throw new Error("Invoice total must be greater than zero.");
  }

  return {
    items: calculatedItems,
    subtotalPaise,
    discountPaise,
    taxPaise,
    totalPaise
  };
};

// Create a new invoice.
export const createInvoice = async data => {
  const {
    customerId,
    subscriptionId,
    items,
    discountPaise = 0,
    dueDate,
    notes = ""
  } = data;

  if (!mongoose.isValidObjectId(customerId)) {
    throw new Error("A valid customerId is required.");
  }

  if (
    subscriptionId &&
    !mongoose.isValidObjectId(subscriptionId)
  ) {
    throw new Error("Invalid subscriptionId.");
  }

  if (!dueDate || Number.isNaN(new Date(dueDate).getTime())) {
    throw new Error("A valid dueDate is required.");
  }

  const totals = calculateInvoice(items, discountPaise);

  const invoice = await Invoice.create({
    invoiceNumber: `INV-${Date.now()}-${randomUUID().slice(0, 8)}`,
    customerId,
    subscriptionId: subscriptionId || null,
    ...totals,
    amountPaidPaise: 0,
    status: "UNPAID",
    dueDate: new Date(dueDate),
    notes
  });

  return formatInvoice(invoice);
};

// Get all invoices, optionally filtered by customer.
export const getInvoices = async customerId => {
  const filter = {};

  if (customerId) {
    if (!mongoose.isValidObjectId(customerId)) {
      throw new Error("Invalid customerId.");
    }

    filter.customerId = customerId;
  }

  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 });

  return invoices.map(formatInvoice);
};

// Get one invoice.
export const getInvoiceById = async invoiceId => {
  if (!mongoose.isValidObjectId(invoiceId)) {
    throw new Error("Invalid invoice ID.");
  }

  const invoice = await Invoice.findById(invoiceId);

  if (!invoice) {
    throw new Error("Invoice not found.");
  }

  return formatInvoice(invoice);
};

// Record a payment against an invoice.
export const recordPayment = async (invoiceId, data) => {
  if (!mongoose.isValidObjectId(invoiceId)) {
    throw new Error("Invalid invoice ID.");
  }

  const {
    amountPaise,
    paymentMethod,
    transactionReference,
    notes = ""
  } = data;

  if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
    throw new Error("Payment amount must be a positive whole number of paise.");
  }

  const allowedMethods = [
    "CASH",
    "UPI",
    "CARD",
    "BANK_TRANSFER",
    "OTHER"
  ];

  if (!allowedMethods.includes(paymentMethod)) {
    throw new Error("Invalid payment method.");
  }

  const reference = transactionReference?.trim() || null;

  // Atomically reserve the payment amount against the invoice.
  // This prevents concurrent payments from exceeding the balance.
  const invoice = await Invoice.findOneAndUpdate(
    {
      _id: invoiceId,
      $expr: {
        $lte: [
          {
            $add: [
              "$amountPaidPaise",
              amountPaise
            ]
          },
          "$totalPaise"
        ]
      }
    },
    [
      {
        $set: {
          amountPaidPaise: {
            $add: ["$amountPaidPaise", amountPaise]
          }
        }
      },
      {
        $set: {
          status: {
            $cond: [
              { $eq: ["$amountPaidPaise", "$totalPaise"] },
              "PAID",
              "PARTIALLY_PAID"
            ]
          }
        }
      }
    ],
    { new: true }
  );

  if (!invoice) {
    const existingInvoice = await Invoice.findById(invoiceId);

    if (!existingInvoice) {
      throw new Error("Invoice not found.");
    }

    throw new Error("Payment exceeds the outstanding invoice balance.");
  }

  try {
    const payment = await Payment.create({
      invoiceId: invoice._id,
      customerId: invoice.customerId,
      amountPaise,
      paymentMethod,
      transactionReference: reference,
      notes
    });

    return {
      payment,
      invoice: formatInvoice(invoice)
    };
  } catch (error) {
    // Restore the invoice balance if payment record creation fails.
    await Invoice.findOneAndUpdate(
      {
        _id: invoiceId,
        amountPaidPaise: { $gte: amountPaise }
      },
      [
        {
          $set: {
            amountPaidPaise: {
              $subtract: ["$amountPaidPaise", amountPaise]
            }
          }
        },
        {
          $set: {
            status: {
              $cond: [
                { $eq: ["$amountPaidPaise", 0] },
                "UNPAID",
                "PARTIALLY_PAID"
              ]
            }
          }
        }
      ]
    );

    throw error;
  }
};

// Get payment history for an invoice.
export const getPaymentsForInvoice = async invoiceId => {
  if (!mongoose.isValidObjectId(invoiceId)) {
    throw new Error("Invalid invoice ID.");
  }

  const invoiceExists = await Invoice.exists({ _id: invoiceId });

  if (!invoiceExists) {
    throw new Error("Invoice not found.");
  }

  return Payment.find({ invoiceId })
    .sort({ paymentDate: -1 });
};
