import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

import { clerkMiddleware, requireAuth } from '@clerk/express'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware())

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "lancr-api" });
});

app.get("/protected", requireAuth, (req, res) => {
  res.json({ message: "you are authenticated" });
});

app.listen(PORT, () => {
  console.log(`Lancr API running on port ${PORT}`);
});
