// Script para probar directamente el endpoint my-trivias
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

// Conectar a MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log("MongoDB conectado");

// Importar modelos
import User from "./models/User.js";
import Trivia from "./models/Trivia.js";

// Middleware de autenticación simplificado
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido" });
  }
};

// Ruta específica para my-trivias
app.get("/api/trivia/my-trivias", authenticateToken, async (req, res) => {
  try {
    console.log(
      "🔍 Ejecutando my-trivias para usuario:",
      req.user._id,
      req.user.role
    );

    if (!["admin", "facilitator"].includes(req.user.role)) {
      return res.status(403).json({
        error:
          "Solo los administradores y facilitadores pueden ver sus trivias",
      });
    }

    const trivias = await Trivia.find({ createdBy: req.user._id })
      .populate("questions")
      .sort({ createdAt: -1 });

    console.log("📊 Trivias encontradas:", trivias.length);
    res.json(trivias);
  } catch (error) {
    console.error("❌ Error en my-trivias:", error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta genérica para capturar otros requests
app.get("/api/trivia/:id", async (req, res) => {
  console.log("🎯 Ruta /:id capturó:", req.params.id);
  res.json({ message: `Intentando acceder a ID: ${req.params.id}` });
});

app.listen(3003, () => {
  console.log("🧪 Servidor de prueba en puerto 3003");
  console.log("Prueba: GET http://localhost:3003/api/trivia/my-trivias");
});
