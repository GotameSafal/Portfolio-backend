import express from "express";
import { config } from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import projectRoute from "./routes/projectRoutes.js";
import userRoute from "./routes/userRoutes.js";
import workplaceRoute from "./routes/workplaceRoutes.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
config({ path: "./config/config.env" });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "https://sdev-portfolio.vercel.app",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  })
);
app.use("/uploads", express.static(join(__dirname, "uploads")));
app.use("/api", projectRoute);
app.use("/api", userRoute);
app.use("/api", workplaceRoute);
app.use(errorMiddleware);

export default app;
