import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trivia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trivia",
      required: true,
    },
    score: { type: Number, default: 0 },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
        selectedAnswer: { type: Number }, // índice de la respuesta elegida
        isCorrect: { type: Boolean },
        points: { type: Number, default: 0 },
      },
    ],
    timeStarted: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Result", ResultSchema);
