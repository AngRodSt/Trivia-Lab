import mongoose from "mongoose";
import dotenv from "dotenv";
import Trivia from "../models/Trivia.js";
import Question from "../models/Questions.js";

dotenv.config();

async function checkTrivias() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/triviaapp"
    );

    console.log("Conectado a MongoDB");

    // Contar trivias y preguntas
    const totalTrivias = await Trivia.countDocuments();
    const totalPreguntas = await Question.countDocuments();

    console.log(`Total de trivias: ${totalTrivias}`);
    console.log(`Total de preguntas: ${totalPreguntas}`);

    // Mostrar algunas trivias de ejemplo
    const trivias = await Trivia.find().populate("questions").limit(5);

    trivias.forEach((trivia) => {
      console.log(`\n ${trivia.title}`);
      console.log(`   Código: ${trivia.code}`);
      console.log(`   Descripción: ${trivia.description}`);
      console.log(`   Preguntas: ${trivia.questions.length}`);

      if (trivia.questions.length > 0) {
        const primeraPreg = trivia.questions[0];
        console.log(`   Primera pregunta: ${primeraPreg.text}`);
        console.log(
          `   Categoría: ${primeraPreg.category} | Dificultad: ${primeraPreg.difficulty}`
        );
      }
    });

    // Mostrar estadísticas por categoría
    const categorias = await Question.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log("\nPreguntas por categoría:");
    categorias.forEach((cat) => {
      console.log(`   ${cat._id}: ${cat.count} preguntas`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkTrivias();
