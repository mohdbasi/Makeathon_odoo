
import mongoose from "mongoose";
import Quotation from "../models/Quotation.js";
import Plan from "../models/Plan.js";

// Generate quotation number
const generateQuotationNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Quotation.countDocuments({
    quotationNumber: { $regex: `^QT-${year}-` }
  });

  return `QT-${year}-${String(count + 1).padStart(3, "0")}`;
};


// CREATE QUOTATION
export const createQuotation = async (req, res) => {
  try {
    const {
      customerId,
      items,
      discount = 0,
      tax = 0,
      validUntil,
      notes = ""
    } = req.body;

    if (!mongoose.isValidObjectId(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Valid customer ID is required"
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one quotation item is required"
      });
    }

    if (
      !Number.isFinite(discount) ||
      !Number.isFinite(tax) ||
      discount < 0 ||
      tax < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount and tax must be non-negative numbers"
      });
    }

    if (!validUntil || Number.isNaN(Date.parse(validUntil))) {
      return res.status(400).json({
        success: false,
        message: "A valid expiry date is required"
      });
    }

    if (new Date(validUntil) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Quotation expiry date must be in the future"
      });
    }

    // Build quotation items using actual plan prices
    const calculatedItems = [];

    for (const item of items) {
      if (!mongoose.isValidObjectId(item.planId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid plan ID"
        });
      }

      const quantity = item.quantity ?? 1;

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Quantity must be a positive integer"
        });
      }

      const plan = await Plan.findOne({
        _id: item.planId,
        isActive: true
      });

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: "Active plan not found"
        });
      }

      const unitPrice = plan.price;
      const setupFee = plan.setupFee || 0;
      const itemTotal = (unitPrice + setupFee) * quantity;

      calculatedItems.push({
        planId: plan._id,
        quantity,
        unitPrice,
        setupFee,
        discount: 0,
        total: itemTotal
      });
    }

    const subtotal = calculatedItems.reduce(
      (sum, item) => sum + item.total,
      0
    );

    if (discount > subtotal) {
      return res.status(400).json({
        success: false,
        message: "Discount cannot exceed subtotal"
      });
    }

    const taxableAmount = subtotal - discount;
    const totalAmount = taxableAmount + (taxableAmount * tax / 100);

    const quotationNumber = await generateQuotationNumber();

    const quotation = await Quotation.create({
      quotationNumber,
      customerId,
      items: calculatedItems,
      subtotal,
      discount,
      tax,
      totalAmount: Number(totalAmount.toFixed(2)),
      currency: "INR",
      validUntil,
      notes
    });

    return res.status(201).json({
      success: true,
      message: "Quotation created successfully",
      data: quotation
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// GET ALL QUOTATIONS
export const getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate("customerId")
      .populate("items.planId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quotations.length,
      data: quotations
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET QUOTATION BY ID
export const getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate("customerId")
      .populate("items.planId");

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: quotation
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE QUOTATION STATUS
export const updateQuotationStatus = async (req, res) => {
  try {
    const allowedStatuses = [
      "draft",
      "sent",
      "accepted",
      "rejected",
      "expired"
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quotation status"
      });
    }

    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quotation status updated successfully",
      data: quotation
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
