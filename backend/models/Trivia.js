import mongoose from "mongoose";

const TriviaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    code: { type: String, unique: true, index: true }, // índice para code
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
      index: true,
    }, // dificultad de la trivia
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    timeLimit: { type: Number, default: null }, // Límite de tiempo en minutos (null = sin límite)
    isActive: { type: Boolean, default: true },
    isPublic: { type: Boolean, default: false }, // Solo trivias públicas aparecen en la lista general
    allowDownloadResults: { type: Boolean, default: true }, // Permitir descargar resultados
  },
  { timestamps: true }
);

export default mongoose.model("Trivia", TriviaSchema);
