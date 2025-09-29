import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // estudiante
  trivia: { type: mongoose.Schema.Types.ObjectId, ref: "Trivia", required: true }, // trivia realizada
  score: { type: Number, required: true }, // puntaje obtenido
  answers: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
      selectedAnswer: { type: Number }, // índice de la respuesta elegida
      isCorrect: { type: Boolean }
    }
  ]
}, { timestamps: true });

export default mongoose.model("Result", ResultSchema);
