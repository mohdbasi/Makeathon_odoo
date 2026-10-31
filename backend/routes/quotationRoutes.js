
import express from "express";

import {
  createQuotation,
  getQuotations,
  getQuotationById,
  updateQuotationStatus
} from "../controllers/quotationController.js";

const router = express.Router();

// Create a quotation
router.post("/", createQuotation);

// Get all quotations
router.get("/", getQuotations);

// Get a quotation by ID
router.get("/:id", getQuotationById);

// Update quotation status
router.patch("/:id/status", updateQuotationStatus);

export default router;
