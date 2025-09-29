import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/triviaapp");

    console.log("✅ Conectado a MongoDB");

    // Limpiar colección
    await User.deleteMany();

    // Crear usuarios de prueba
    const usuarios = [
      { username: "juan123", email: "juan@example.com", password: "123456", role: "estudiante" },
      { username: "ana456", email: "ana@example.com", password: "abcdef", role: "maestro" },
      { username: "pedro789", email: "pedro@example.com", password: "qwerty", role: "estudiante" }
    ];

    // Como tienes el hook de "pre save", hay que usar User.create uno a uno o en bulk
    for (let u of usuarios) {
      const user = new User(u);
      await user.save(); // aquí se ejecuta el hash automático
    }

    console.log(" Seed completado");
    process.exit();
  } catch (error) {
    console.error(" Error en seed:", error);
    process.exit(1);
  }
}

seed();
