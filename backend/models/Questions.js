import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    category: { type: String, index: true }, // índice para categoría
    difficulty: { type: String, enum: ["easy", "medium", "hard"], index: true }, // índice para dificultad
    trivia: { type: mongoose.Schema.Types.ObjectId, ref: "Trivia" },
  },
  { timestamps: true }
);

// índice compuesto
QuestionSchema.index({ category: 1, difficulty: 1 });

export default mongoose.model("Question", QuestionSchema);
