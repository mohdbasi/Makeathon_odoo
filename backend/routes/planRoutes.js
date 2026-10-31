
import express from "express";

import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan
} from "../controllers/planController.js";

const router = express.Router();

// Create a new plan
router.post("/", createPlan);

// Get all active plans
router.get("/", getPlans);

// Get a specific plan
router.get("/:id", getPlanById);

// Update a plan
router.put("/:id", updatePlan);

// Deactivate a plan
router.delete("/:id", deletePlan);

export default router;
