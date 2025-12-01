import cookieParser from "cookie-parser";
import express from "express";
import jobRoutes from "./routes/job.route.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/jobs", jobRoutes);

export default app;
