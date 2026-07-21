import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import tenderRoutes from "./routes/tenderRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/tenders", tenderRoutes);
app.use("/api/bids", bidRoutes);

app.get("/", (req, res) => {
  res.send("TenderVault API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
