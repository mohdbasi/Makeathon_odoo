
import Plan from "../models/Plan.js";
import Product from "../models/Product.js";

// CREATE PLAN
export const createPlan = async (req, res) => {
  try {
    const {
      productId,
      name,
      description,
      price,
      currency,
      billingCycle,
      trialDays,
      setupFee
    } = req.body;

    // Check whether the product exists and is active
    const product = await Product.findOne({
      _id: productId,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Active product not found"
      });
    }

    const plan = await Plan.create({
      productId,
      name,
      description,
      price,
      currency,
      billingCycle,
      trialDays,
      setupFee
    });

    return res.status(201).json({
      success: true,
      message: "Plan created successfully",
      data: plan
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// GET ALL ACTIVE PLANS
export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true })
      .populate("productId", "name category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: plans.length,
      data: plans
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET PLAN BY ID
export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findOne({
      _id: req.params.id,
      isActive: true
    }).populate("productId", "name category");

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: plan
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// UPDATE PLAN
export const updatePlan = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "description",
      "price",
      "currency",
      "billingCycle",
      "trialDays",
      "setupFee"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      updates,
      { new: true, runValidators: true }
    ).populate("productId", "name category");

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: plan
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// DEACTIVATE PLAN
export const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.id, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Plan deactivated successfully"
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
