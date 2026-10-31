
import {
  recordPayment,
  getPaymentsForInvoice
} from "../services/billingService.js";

export const recordPaymentController = async (req, res) => {
  try {
    const result = await recordPayment(
      req.params.invoiceId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully.",
      data: result
    });
  } catch (error) {
    let status = 400;

    if (error.message === "Invoice not found.") {
      status = 404;
    }

    if (error.code === 11000) {
      status = 409;
    }

    res.status(status).json({
      success: false,
      message:
        error.code === 11000
          ? "This transaction reference has already been used."
          : error.message
    });
  }
};

export const getPaymentsController = async (req, res) => {
  try {
    const payments = await getPaymentsForInvoice(
      req.params.invoiceId
    );

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    const status = error.message === "Invoice not found." ? 404 : 400;

    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};
