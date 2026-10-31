
import express from "express";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from "../controllers/customerController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only authenticated staff/admin can manage customers
router.get("/", protect, authorize("admin", "staff"), getCustomers);
router.get("/:id", protect, authorize("admin", "staff"), getCustomerById);
router.post("/", protect, authorize("admin", "staff"), createCustomer);
router.put("/:id", protect, authorize("admin", "staff"), updateCustomer);
router.delete("/:id", protect, authorize("admin"), deleteCustomer);

export default router;
