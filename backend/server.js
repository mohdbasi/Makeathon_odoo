import customerRoutes from "./routes/customerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import quotationRoutes from "./routes/quotationRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Test API
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Subscription Management API is running!"
  });
});

// Start server only after database connects
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
