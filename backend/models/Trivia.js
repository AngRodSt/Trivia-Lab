import mongoose from "mongoose";

const TriviaSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  code: { type: String, unique: true, index: true }, // índice para code
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Trivia", TriviaSchema);
