
import mongoose from "mongoose";
import Subscription from "../models/Subscription.js";
import Quotation from "../models/Quotation.js";
import Plan from "../models/Plan.js";

// Calculate next billing date
const calculateNextBillingDate = (date, cycle) => {
  const nextDate = new Date(date);

  switch (cycle) {
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;

    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;

    case "quarterly":
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;

    case "yearly":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;

    default:
      throw new Error("Invalid billing cycle");
  }

  return nextDate;
};


// Generate subscription number
const generateSubscriptionNumber = async () => {
  const year = new Date().getFullYear();

  const count = await Subscription.countDocuments({
    subscriptionNumber: {
      $regex: `^SUB-${year}-`
    }
  });

  return `SUB-${year}-${String(count + 1).padStart(3, "0")}`;
};


// CREATE SUBSCRIPTION FROM ACCEPTED QUOTATION
export const createSubscription = async (req, res) => {
  try {
    const { quotationId, planId, startDate, autoRenew = true } = req.body;

    if (
      !mongoose.isValidObjectId(quotationId) ||
      !mongoose.isValidObjectId(planId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid quotation ID and plan ID are required"
      });
    }

    const quotation = await Quotation.findById(quotationId);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        message: "Quotation not found"
      });
    }

    if (quotation.status !== "accepted") {
      return res.status(400).json({
        success: false,
        message: "Only accepted quotations can create subscriptions"
      });
    }

    if (new Date(quotation.validUntil) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Quotation has expired"
      });
    }

    const plan = await Plan.findOne({
      _id: planId,
      isActive: true
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Active plan not found"
      });
    }

    const quotationItem = quotation.items.find(
      item => item.planId.toString() === planId
    );

    if (!quotationItem) {
      return res.status(400).json({
        success: false,
        message: "Selected plan is not included in this quotation"
      });
    }

    const subscriptionStartDate = startDate
      ? new Date(startDate)
      : new Date();

    if (Number.isNaN(subscriptionStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription start date"
      });
    }

    const nextBillingDate = calculateNextBillingDate(
      subscriptionStartDate,
      plan.billingCycle
    );

    const subscriptionNumber = await generateSubscriptionNumber();

    const subscription = await Subscription.create({
      subscriptionNumber,
      customerId: quotation.customerId,
      quotationId: quotation._id,
      planId: plan._id,
      amount: quotationItem.unitPrice,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      startDate: subscriptionStartDate,
      currentPeriodStart: subscriptionStartDate,
      currentPeriodEnd: nextBillingDate,
      nextBillingDate,
      autoRenew
    });

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      data: subscription
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// GET ALL SUBSCRIPTIONS
export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate("customerId")
      .populate("quotationId")
      .populate("planId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// GET SUBSCRIPTION BY ID
export const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate("customerId")
      .populate("quotationId")
      .populate("planId");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: subscription
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// PAUSE SUBSCRIPTION
export const pauseSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    if (subscription.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active subscriptions can be paused"
      });
    }

    subscription.status = "paused";
    subscription.pausedAt = new Date();

    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription paused successfully",
      data: subscription
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// RESUME SUBSCRIPTION
export const resumeSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    if (subscription.status !== "paused") {
      return res.status(400).json({
        success: false,
        message: "Only paused subscriptions can be resumed"
      });
    }

    subscription.status = "active";
    subscription.pausedAt = null;

    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription resumed successfully",
      data: subscription
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// CANCEL SUBSCRIPTION
export const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    if (["cancelled", "expired"].includes(subscription.status)) {
      return res.status(400).json({
        success: false,
        message: "Subscription is already cancelled or expired"
      });
    }

    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    subscription.endDate = new Date();
    subscription.autoRenew = false;

    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      data: subscription
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// RENEW SUBSCRIPTION
export const renewSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    if (subscription.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Only active subscriptions can be renewed"
      });
    }

    const plan = await Plan.findById(subscription.planId);

    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: "Active plan not found"
      });
    }

    const renewalStart = new Date(subscription.nextBillingDate);

    if (renewalStart < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Billing date is overdue; process the pending billing first"
      });
    }

    const nextBillingDate = calculateNextBillingDate(
      renewalStart,
      subscription.billingCycle
    );

    subscription.currentPeriodStart = renewalStart;
    subscription.currentPeriodEnd = nextBillingDate;
    subscription.nextBillingDate = nextBillingDate;
    subscription.amount = plan.price;

    await subscription.save();

    return res.status(200).json({
      success: true,
      message: "Subscription renewed successfully",
      data: subscription
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
