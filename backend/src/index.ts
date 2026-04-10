import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import fs from "fs";

import sequelize from "./utils/database";
import "./models/index"; // register all models + associations

import authRoutes     from "./routes/auth.routes";
import productRoutes  from "./routes/product.routes";
import cartRoutes     from "./routes/cart.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import orderRoutes    from "./routes/order.routes";
import userRoutes     from "./routes/user.routes";

import { errorHandler } from "./middleware";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Ensure upload dir exists ─────────────────────────────────────────────────
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Static files ─────────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// ─── Swagger ──────────────────────────────────────────────────────────────────
const swaggerPath = path.join(__dirname, "../swagger/documentation.yml");
if (fs.existsSync(swaggerPath)) {
  const swaggerDoc = YAML.load(swaggerPath);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/products",  productRoutes);
app.use("/api/cart",      cartRoutes);
app.use("/api/wishlist",  wishlistRoutes);
app.use("/api/orders",    orderRoutes);
app.use("/api/users",     userRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({ alter: true });
    console.log("✅ Models synced");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Swagger docs at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();
