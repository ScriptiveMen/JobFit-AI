import express from "express";
import morgan from "morgan";
import resumeRoutes from "./routes/resume.routes.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/resume", resumeRoutes);

export default app;
