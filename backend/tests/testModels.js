
import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/user.js";
import Customer from "../models/customer.js";

dotenv.config();

const testModels = async () => {
  let testUser;
  let testCustomer;

  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected!");

    // 2. Create a test user
    testUser = await User.create({
      name: "Test Akmal",
      email: `akmal_test_${Date.now()}@example.com`,
      password: "dummy_test_password",
      role: "staff"
    });

    console.log("User model test passed!");
    console.log("Created User ID:", testUser._id);

    // 3. Create a test customer linked to the user
    testCustomer = await Customer.create({
      name: "Test Customer",
      email: `customer_test_${Date.now()}@example.com`,
      phone: "9876543210",
      address: "Kochi, Kerala",
      userId: testUser._id
    });

    console.log("Customer model test passed!");
    console.log("Created Customer ID:", testCustomer._id);

    // 4. Test the relationship
    const linkedCustomer = await Customer.findById(
      testCustomer._id
    ).populate("userId", "name email");

    console.log("Customer linked to user:", linkedCustomer.userId.name);

    console.log("\nAll model tests passed!");

  } catch (error) {
    console.error("Model test failed:", error.message);
  } finally {
    // 5. Remove only the test records created above
    if (testCustomer) {
      await Customer.findByIdAndDelete(testCustomer._id);
    }

    if (testUser) {
      await User.findByIdAndDelete(testUser._id);
    }

    await mongoose.disconnect();
    console.log("Test cleanup completed.");
  }
};

testModels();
