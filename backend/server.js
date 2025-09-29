import express, { json } from "express";
import { connect } from "mongoose";
import cors from "cors";
// require("dotenv").config();
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth";
import triviaRoutes from "./routes/trivia";
import resultsRoutes from "./routes/results";

const app = express();
app.use(cors());
app.use(json());

// Conexión Mongo con async/await
async function startServer() {
  try {
    await connect(process.env.MONGO_URI || "mongodb://localhost:27017/triviaapp", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ MongoDB conectado");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
  } catch (err) {
    console.error("❌ Error conectando a MongoDB:", err);
    process.exit(1);
  }
}

startServer();

app.use("/api/auth", authRoutes);
app.use("/api/trivia", triviaRoutes);
app.use("/api/results", resultsRoutes);
