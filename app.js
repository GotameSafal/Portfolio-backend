import express from "express";
import { config } from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import projectRoute from "./routes/projectRoutes.js";
import userRoute from "./routes/userRoutes.js";
const app = express();
config({ path: "./config/config.env" });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "*" }));
app.use(errorMiddleware);

app.use("/api", projectRoute);
app.use("/api", userRoute);

export default app;
