import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import applicationRoutes from "./routes/application.routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/application", applicationRoutes);

export default app;
