import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import shortlistRoutes from "./routes/shortlist.route.js";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/shortlist", shortlistRoutes);

export default app;
