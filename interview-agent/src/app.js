import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import interviewAgent from "./routes/interviewAgent.routes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/practice", interviewAgent);

export default app;
