
import express from "express";

import {
  createInvoiceController,
  getInvoicesController,
  getInvoiceByIdController
} from "../controllers/invoiceController.js";

const router = express.Router();

// POST /api/invoices
router.post("/", createInvoiceController);

// GET /api/invoices
// GET /api/invoices?customerId=...
router.get("/", getInvoicesController);

// GET /api/invoices/:id
router.get("/:id", getInvoiceByIdController);

export default router;
