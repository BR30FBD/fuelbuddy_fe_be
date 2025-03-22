import Fastify from "fastify";
import dotenv from "dotenv";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import prisma from "./prisma";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/task";

dotenv.config();
const app = Fastify();

app.register(cors, {
  origin: "*", // Allow all origins (adjust as needed)
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
});
app.register(jwt, { secret: process.env.JWT_SECRET || "secret" });

app.register(authRoutes);
app.register(taskRoutes);

const PORT = 3000;
app.listen({ port: PORT, host: "0.0.0.0" }, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
