
import express from "express";

import {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  renewSubscription
} from "../controllers/subscriptionController.js";

const router = express.Router();

// Create subscription from accepted quotation
router.post("/", createSubscription);

// Get all subscriptions
router.get("/", getSubscriptions);

// Get subscription by ID
router.get("/:id", getSubscriptionById);

// Pause subscription
router.patch("/:id/pause", pauseSubscription);

// Resume subscription
router.patch("/:id/resume", resumeSubscription);

// Cancel subscription
router.patch("/:id/cancel", cancelSubscription);

// Renew subscription
router.patch("/:id/renew", renewSubscription);

export default router;
