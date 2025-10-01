import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "../models/Questions.js";

dotenv.config({ path: "../.env" });

async function checkDistribution() {
  try {
    console.log("🔍 Conectando a MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB");

    // Obtener todas las preguntas
    const questions = await Question.find({});

    // Contar distribución de respuestas correctas
    const distribution = { 0: 0, 1: 0, 2: 0, 3: 0 };

    questions.forEach((question) => {
      distribution[question.correctAnswer]++;
    });

    console.log("\n📊 Distribución de respuestas correctas:");
    console.log(
      `Posición 0 (A): ${distribution[0]} preguntas (${(
        (distribution[0] / questions.length) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `Posición 1 (B): ${distribution[1]} preguntas (${(
        (distribution[1] / questions.length) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `Posición 2 (C): ${distribution[2]} preguntas (${(
        (distribution[2] / questions.length) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `Posición 3 (D): ${distribution[3]} preguntas (${(
        (distribution[3] / questions.length) *
        100
      ).toFixed(1)}%)`
    );
    console.log(`\nTotal de preguntas: ${questions.length}`);

    // Mostrar algunas preguntas de ejemplo
    console.log("\n🎲 Ejemplos de preguntas mezcladas:");
    const ejemplos = questions.slice(0, 5);
    ejemplos.forEach((q, i) => {
      console.log(`\n${i + 1}. ${q.text}`);
      q.options.forEach((opt, j) => {
        const marker = j === q.correctAnswer ? "✅" : "  ";
        console.log(`   ${marker} ${String.fromCharCode(65 + j)}) ${opt}`);
      });
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Desconectado de MongoDB");
  }
}

checkDistribution();
