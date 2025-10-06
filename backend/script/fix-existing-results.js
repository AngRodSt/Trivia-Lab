// Script para actualizar resultados existentes y corregir datos faltantes
import mongoose from "mongoose";
import dotenv from "dotenv";
import Result from "../models/Result.js";
import Question from "../models/Questions.js";
import Trivia from "../models/Trivia.js";

dotenv.config();

async function updateExistingResults() {
  try {
    console.log("🔍 Conectando a MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Conectado a MongoDB");

    console.log("🔍 Buscando resultados que necesitan actualización...");

    // Buscar todos los resultados
    const results = await Result.find({}).populate("trivia");

    console.log(`📊 Encontrados ${results.length} resultados para revisar`);

    let updatedCount = 0;
    let errorsCount = 0;

    for (const result of results) {
      try {
        let needsUpdate = false;

        // Verificar si hay respuestas sin isCorrect
        for (let answer of result.answers) {
          if (answer.isCorrect === undefined || answer.isCorrect === null) {
            console.log(
              `🔧 Actualizando respuesta sin isCorrect en resultado ${result._id}`
            );

            // Buscar la pregunta para verificar la respuesta correcta
            const question = await Question.findById(answer.questionId);
            if (question) {
              answer.isCorrect =
                question.correctAnswer === answer.selectedAnswer;
              answer.points = answer.isCorrect ? 100 : 0;
              needsUpdate = true;
            }
          }
        }

        // Recalcular el score basado en las respuestas correctas
        const correctCount = result.answers.filter((a) => a.isCorrect).length;
        const expectedScore = correctCount * 100;

        if (result.score !== expectedScore) {
          console.log(
            `📊 Actualizando score de ${result.score} a ${expectedScore} para resultado ${result._id}`
          );
          result.score = expectedScore;
          needsUpdate = true;
        }

        // Guardar si hay cambios
        if (needsUpdate) {
          await result.save();
          updatedCount++;
          console.log(
            `✅ Actualizado resultado ${result._id} - Trivia: ${result.trivia?.title}`
          );
        }
      } catch (error) {
        errorsCount++;
        console.error(
          `❌ Error actualizando resultado ${result._id}:`,
          error.message
        );
      }
    }

    console.log("\n📋 Resumen de actualización:");
    console.log(`✅ Resultados actualizados: ${updatedCount}`);
    console.log(`❌ Errores: ${errorsCount}`);
    console.log(`📊 Total revisados: ${results.length}`);
  } catch (error) {
    console.error("❌ Error general:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Desconectado de MongoDB");
  }
}

// Ejecutar el script
updateExistingResults();
