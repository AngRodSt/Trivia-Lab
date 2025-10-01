import mongoose from "mongoose";
import dotenv from "dotenv";
import Trivia from "../models/Trivia.js";
import Question from "../models/Questions.js";

dotenv.config();

async function testDifficulties() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/triviaapp"
    );
    console.log("✅ Conectado a MongoDB");

    const trivias = await Trivia.find().populate("questions", "difficulty");

    console.log("\n📊 Resumen de trivias por dificultad:");

    const difficultyCount = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    trivias.forEach((trivia, index) => {
      if (index < 10) {
        // Mostrar solo las primeras 10 para no saturar
        console.log(
          `${index + 1}. ${trivia.title} - Dificultad: ${trivia.difficulty}`
        );
      }
      difficultyCount[trivia.difficulty]++;
    });

    console.log("\n📈 Distribución por dificultad:");
    console.log(`🟢 Fácil: ${difficultyCount.easy} trivias`);
    console.log(`🟡 Medio: ${difficultyCount.medium} trivias`);
    console.log(`🔴 Difícil: ${difficultyCount.hard} trivias`);
    console.log(`📊 Total: ${trivias.length} trivias`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testDifficulties();
