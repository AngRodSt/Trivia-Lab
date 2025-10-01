import mongoose from "mongoose";
import dotenv from "dotenv";
import Trivia from "../models/Trivia.js";
import Question from "../models/Questions.js";

dotenv.config();

async function testAPIResponse() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/triviaapp"
    );
    console.log("✅ Conectado a MongoDB");

    // Simular la respuesta de la API como en routes/trivia.js
    const trivias = await Trivia.find({ isActive: true })
      .populate("createdBy", "name")
      .populate("questions", "category difficulty")
      .sort({ createdAt: -1 });

    const triviasWithStats = trivias.map((trivia) => ({
      _id: trivia._id,
      title: trivia.title,
      description: trivia.description,
      code: trivia.code,
      difficulty: trivia.difficulty,
      createdBy: trivia.createdBy,
      questions: trivia.questions,
      questionsCount: trivia.questions.length,
      categories: [...new Set(trivia.questions.map((q) => q.category))],
      createdAt: trivia.createdAt,
    }));

    console.log("\n📋 Primeras 5 trivias con su estructura completa:");
    console.log("=====================================\n");

    triviasWithStats.slice(0, 5).forEach((trivia, index) => {
      console.log(`${index + 1}. TÍTULO: ${trivia.title}`);
      console.log(`   DIFICULTAD: ${trivia.difficulty}`);
      console.log(`   CATEGORÍAS: [${trivia.categories.join(", ")}]`);
      console.log(`   PREGUNTAS: ${trivia.questionsCount}`);
      console.log(`   CÓDIGO: ${trivia.code}`);
      console.log(`   ─────────────────────────────────────\n`);
    });

    // Verificar filtrado por dificultad
    console.log("🔍 Pruebas de filtrado:");
    console.log("======================\n");

    const fáciles = triviasWithStats.filter((t) => t.difficulty === "easy");
    const medias = triviasWithStats.filter((t) => t.difficulty === "medium");
    const difíciles = triviasWithStats.filter((t) => t.difficulty === "hard");

    console.log(`📊 Filtro "easy": ${fáciles.length} trivias encontradas`);
    console.log(`📊 Filtro "medium": ${medias.length} trivias encontradas`);
    console.log(`📊 Filtro "hard": ${difíciles.length} trivias encontradas`);

    // Verificar filtrado por categoría (ejemplo)
    const programación = triviasWithStats.filter((t) =>
      t.categories.some((cat) => cat.toLowerCase() === "programación")
    );
    console.log(
      `📊 Filtro "Programación": ${programación.length} trivias encontradas`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testAPIResponse();
