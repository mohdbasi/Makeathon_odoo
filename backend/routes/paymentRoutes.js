
import express from "express";

import {
  recordPaymentController,
  getPaymentsController
} from "../controllers/paymentController.js";

const router = express.Router();

// POST /api/payments/:invoiceId
router.post("/:invoiceId", recordPaymentController);

// GET /api/payments/:invoiceId
router.get("/:invoiceId", getPaymentsController);

export default router;
