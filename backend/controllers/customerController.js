
import Customer from "../models/customer.js";

// GET ALL CUSTOMERS
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate("userId", "name email");

    res.status(200).json({
      success: true,
      count: customers.length,
      customers
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve customers"
    });
  }
};

// GET CUSTOMER BY ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate("userId", "name email");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      customer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve customer"
    });
  }
};

// CREATE CUSTOMER
export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      address
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create customer"
    });
  }
};

// UPDATE CUSTOMER
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update customer"
    });
  }
};

// DELETE CUSTOMER
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete customer"
    });
  }
};
