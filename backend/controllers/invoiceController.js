
import {
  createInvoice,
  getInvoices,
  getInvoiceById
} from "../services/billingService.js";

export const createInvoiceController = async (req, res) => {
  try {
    const invoice = await createInvoice(req.body);

    res.status(201).json({
      success: true,
      message: "Invoice created successfully.",
      data: invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getInvoicesController = async (req, res) => {
  try {
    const invoices = await getInvoices(req.query.customerId);

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getInvoiceByIdController = async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id);

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    const status = error.message === "Invoice not found." ? 404 : 400;

    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};
