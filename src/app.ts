import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.ts";
import groupRoutes from "./routes/groupRoutes.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);

// middleware global d’erreur
app.use(errorHandler);

export default app;
