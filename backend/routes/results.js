import { Router } from "express";
import Result from "../models/Result.js";
import Trivia from "../models/Trivia.js";
import Question from "../models/Questions.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Enviar respuestas de una trivia
router.post("/submit", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "estudiante") {
      return res.status(403).json({ error: "Solo los estudiantes pueden enviar respuestas" });
    }

    const { triviaId, answers } = req.body; // answers: [{ questionId, selectedAnswer }]
    
    // Verificar que la trivia existe y está activa
    const trivia = await Trivia.findById(triviaId).populate("questions");
    if (!trivia || !trivia.isActive) {
      return res.status(404).json({ error: "Trivia no encontrada o inactiva" });
    }

    // Verificar que no haya enviado respuestas antes
    const existingResult = await Result.findOne({
      user: req.user.id,
      trivia: triviaId
    });

    if (existingResult) {
      return res.status(400).json({ error: "Ya has completado esta trivia" });
    }

    // Calificar respuestas
    let score = 0;
    const gradedAnswers = [];

    for (const answer of answers) {
      const question = await Question.findById(answer.questionId);
      if (!question) continue;

      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) score++;

      gradedAnswers.push({
        question: question._id,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      });
    }

    // Guardar resultado
    const result = new Result({
      user: req.user.id,
      trivia: triviaId,
      score,
      answers: gradedAnswers
    });

    await result.save();

    res.json({
      message: "Trivia completada exitosamente",
      score,
      totalQuestions: trivia.questions.length,
      percentage: Math.round((score / trivia.questions.length) * 100),
      answers: gradedAnswers
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener resultados del estudiante
router.get("/my-results", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "estudiante") {
      return res.status(403).json({ error: "Solo los estudiantes pueden ver sus resultados" });
    }

    const results = await Result.find({ user: req.user.id })
      .populate({
        path: "trivia",
        select: "title description createdAt"
      })
      .sort({ createdAt: -1 });

    const formattedResults = results.map(result => ({
      id: result._id,
      trivia: result.trivia,
      score: result.score,
      totalQuestions: result.answers.length,
      percentage: Math.round((result.score / result.answers.length) * 100),
      completedAt: result.createdAt
    }));

    res.json(formattedResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener resultados de una trivia específica (para maestros)
router.get("/trivia/:triviaId", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "maestro") {
      return res.status(403).json({ error: "Solo los maestros pueden ver resultados de trivias" });
    }

    const { triviaId } = req.params;
    
    // Verificar que el maestro es propietario de la trivia
    const trivia = await Trivia.findById(triviaId);
    if (!trivia) {
      return res.status(404).json({ error: "Trivia no encontrada" });
    }

    if (trivia.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "No tienes permisos para ver estos resultados" });
    }

    const results = await Result.find({ trivia: triviaId })
      .populate({
        path: "user",
        select: "username email"
      })
      .populate({
        path: "answers.question",
        select: "text options correctAnswer"
      })
      .sort({ score: -1, createdAt: -1 });

    const statistics = {
      totalParticipants: results.length,
      averageScore: results.length > 0 ? 
        Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length * 100) / 100 : 0,
      highestScore: results.length > 0 ? Math.max(...results.map(r => r.score)) : 0,
      lowestScore: results.length > 0 ? Math.min(...results.map(r => r.score)) : 0
    };

    res.json({
      trivia: {
        id: trivia._id,
        title: trivia.title,
        totalQuestions: trivia.questions.length
      },
      statistics,
      results: results.map(result => ({
        id: result._id,
        student: result.user,
        score: result.score,
        percentage: Math.round((result.score / result.answers.length) * 100),
        completedAt: result.createdAt,
        answers: result.answers
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener detalle de un resultado específico
router.get("/:resultId/detail", authenticateToken, async (req, res) => {
  try {
    const result = await Result.findById(req.params.resultId)
      .populate("user", "username email")
      .populate("trivia", "title description")
      .populate({
        path: "answers.question",
        select: "text options correctAnswer category difficulty"
      });

    if (!result) {
      return res.status(404).json({ error: "Resultado no encontrado" });
    }

    // Verificar permisos: el estudiante solo puede ver sus resultados,
    // el maestro puede ver resultados de sus trivias
    if (req.user.role === "estudiante" && result.user._id.toString() !== req.user.id) {
      return res.status(403).json({ error: "No tienes permisos para ver este resultado" });
    }

    if (req.user.role === "maestro") {
      const trivia = await Trivia.findById(result.trivia._id);
      if (trivia.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ error: "No tienes permisos para ver este resultado" });
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;