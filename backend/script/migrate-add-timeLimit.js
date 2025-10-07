import mongoose from "mongoose";
import dotenv from "dotenv";
import Trivia from "../models/Trivia.js";

dotenv.config();

async function migrateTimeLimit() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/triviaapp"
    );
    console.log("🔍 Conectado a MongoDB");

    // Buscar trivias que no tienen el campo timeLimit
    const triviasWithoutTimeLimit = await Trivia.find({
      $or: [{ timeLimit: { $exists: false } }, { timeLimit: null }],
    });

    console.log(
      `📊 Encontradas ${triviasWithoutTimeLimit.length} trivias sin límite de tiempo`
    );

    if (triviasWithoutTimeLimit.length === 0) {
      console.log(
        "✅ Todas las trivias ya tienen el campo timeLimit configurado"
      );
      await mongoose.disconnect();
      return;
    }

    // Actualizar todas las trivias sin timeLimit para que tengan null (sin límite)
    const result = await Trivia.updateMany(
      {
        $or: [{ timeLimit: { $exists: false } }, { timeLimit: undefined }],
      },
      {
        $set: { timeLimit: null },
      }
    );

    console.log(
      `✅ Migración completada: ${result.modifiedCount} trivias actualizadas`
    );
    console.log(
      "📝 Las trivias existentes ahora tienen timeLimit: null (sin límite de tiempo)"
    );

    // Verificar la migración
    const allTrivias = await Trivia.find({}, "title timeLimit").limit(5);
    console.log("\n📋 Muestra de trivias después de la migración:");
    allTrivias.forEach((trivia, index) => {
      console.log(
        `${index + 1}. ${trivia.title}: ${
          trivia.timeLimit ? `${trivia.timeLimit} min` : "Sin límite"
        }`
      );
    });
  } catch (error) {
    console.error("❌ Error durante la migración:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Desconectado de MongoDB");
  }
}

console.log("🚀 Iniciando migración para agregar campo timeLimit...");
migrateTimeLimit();
