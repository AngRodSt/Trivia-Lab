import { Router } from "express";
import Result from "../models/Result.js";
import Trivia from "../models/Trivia.js";
import Question from "../models/Questions.js";
import User from "../models/User.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Obtener leaderboard global
router.get("/leaderboard", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Obtener mejores puntuaciones por usuario
    const leaderboard = await Result.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $lookup: {
          from: "trivias",
          localField: "trivia",
          foreignField: "_id",
          as: "triviaInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $unwind: "$triviaInfo",
      },
      {
        $group: {
          _id: "$user",
          user: { $first: "$userInfo" },
          totalScore: { $sum: "$score" },
          triviasCompleted: { $sum: 1 },
          averageScore: { $avg: "$score" },
          bestScore: { $max: "$score" },
          lastActivity: { $max: "$completedAt" },
        },
      },
      {
        $sort: { totalScore: -1, averageScore: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          _id: 0,
          user: {
            _id: "$user._id",
            name: "$user.name",
            email: "$user.email",
          },
          totalScore: 1,
          triviasCompleted: 1,
          averageScore: { $round: ["$averageScore", 1] },
          bestScore: 1,
          lastActivity: 1,
        },
      },
    ]);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener leaderboard de una trivia específica
router.get("/leaderboard/:triviaId", async (req, res) => {
  try {
    const { triviaId } = req.params;
    const { limit = 10 } = req.query;

    const leaderboard = await Result.find({
      trivia: triviaId,
      completedAt: { $ne: null },
    })
      .populate("user", "name email")
      .populate("trivia", "title")
      .sort({ score: -1, completedAt: 1 })
      .limit(parseInt(limit));

    const formattedLeaderboard = leaderboard.map((result, index) => ({
      position: index + 1,
      user: {
        _id: result.user._id,
        name: result.user.name,
        email: result.user.email,
      },
      trivia: {
        _id: result.trivia._id,
        title: result.trivia.title,
      },
      score: result.score,
      completedAt: result.completedAt,
      percentage: Math.round((result.score / result.answers.length) * 100),
    }));

    res.json(formattedLeaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener estadísticas del usuario
router.get("/user-stats/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar que el usuario puede ver estas estadísticas
    if (req.user._id.toString() !== userId && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "No tienes permisos para ver estas estadísticas" });
    }

    const results = await Result.find({
      user: userId,
      completedAt: { $ne: null },
    }).populate({
      path: "trivia",
      select: "title questions",
      populate: {
        path: "questions",
        select: "_id",
      },
    });

    if (results.length === 0) {
      return res.json({
        triviasCompleted: 0,
        totalScore: 0,
        averageScore: 0,
        bestScore: 0,
        recentActivity: [],
      });
    }

    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const averageScore = totalScore / results.length;
    const bestScore = Math.max(...results.map((r) => r.score));

    // Actividad reciente (últimas 5 trivias)
    const recentActivity = results
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5)
      .map((result) => {
        const totalQuestions = result.trivia.questions
          ? result.trivia.questions.length
          : 0;
        const correctAnswers = result.answers
          ? result.answers.filter((a) => a.isCorrect).length
          : 0;

        return {
          trivia: {
            _id: result.trivia._id,
            title: result.trivia.title,
          },
          score: result.score,
          completedAt: result.completedAt,
          totalQuestions,
          correctAnswers,
          percentage:
            totalQuestions > 0
              ? Math.round((correctAnswers / totalQuestions) * 100)
              : 0,
        };
      });

    res.json({
      triviasCompleted: results.length,
      totalScore,
      averageScore: Math.round(averageScore * 10) / 10,
      bestScore,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener estadísticas personales del usuario autenticado
router.get("/my-stats", authenticateToken, async (req, res) => {
  try {
    const results = await Result.find({
      user: req.user._id,
      completedAt: { $ne: null },
    }).populate({
      path: "trivia",
      select: "title questions",
      populate: {
        path: "questions",
        select: "_id",
      },
    });

    if (results.length === 0) {
      return res.json({
        triviasCompleted: 0,
        totalScore: 0,
        averageScore: 0,
        bestScore: 0,
        globalRank: null,
        recentActivity: [],
      });
    }

    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const averageScore = totalScore / results.length;
    const bestScore = Math.max(...results.map((r) => r.score));

    // Calcular posición en ranking global
    const betterUsers = await Result.aggregate([
      {
        $group: {
          _id: "$user",
          totalScore: { $sum: "$score" },
        },
      },
      {
        $match: {
          totalScore: { $gt: totalScore },
        },
      },
      {
        $count: "count",
      },
    ]);

    const globalRank = betterUsers.length > 0 ? betterUsers[0].count + 1 : 1;

    // Actividad reciente
    const recentActivity = results
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5)
      .map((result) => {
        const totalQuestions = result.trivia.questions
          ? result.trivia.questions.length
          : 0;
        const correctAnswers = result.answers
          ? result.answers.filter((a) => a.isCorrect).length
          : 0;

        return {
          trivia: {
            _id: result.trivia._id,
            title: result.trivia.title,
          },
          score: result.score,
          completedAt: result.completedAt,
          totalQuestions,
          correctAnswers,
          percentage:
            totalQuestions > 0
              ? Math.round((correctAnswers / totalQuestions) * 100)
              : 0,
        };
      });

    res.json({
      triviasCompleted: results.length,
      totalScore,
      averageScore: Math.round(averageScore * 10) / 10,
      bestScore,
      globalRank,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enviar respuestas de una trivia
router.post("/submit", authenticateToken, async (req, res) => {
  try {
    if (!["user"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Solo los usuarios pueden enviar respuestas" });
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
      trivia: triviaId,
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
        isCorrect,
      });
    }

    // Guardar resultado
    const result = new Result({
      user: req.user.id,
      trivia: triviaId,
      score,
      answers: gradedAnswers,
    });

    await result.save();

    res.json({
      message: "Trivia completada exitosamente",
      score,
      totalQuestions: trivia.questions.length,
      percentage: Math.round((score / trivia.questions.length) * 100),
      answers: gradedAnswers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener resultados del estudiante
router.get("/my-results", authenticateToken, async (req, res) => {
  try {
    if (!["user"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Solo los usuarios pueden ver sus resultados" });
    }

    const results = await Result.find({ user: req.user.id })
      .populate({
        path: "trivia",
        select: "title description createdAt",
      })
      .sort({ createdAt: -1 });

    const formattedResults = results.map((result) => ({
      id: result._id,
      trivia: result.trivia,
      score: result.score,
      totalQuestions: result.answers.length,
      percentage: Math.round((result.score / result.answers.length) * 100),
      completedAt: result.createdAt,
    }));

    res.json(formattedResults);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener resultados de una trivia específica (para maestros)
router.get("/trivia/:triviaId", authenticateToken, async (req, res) => {
  try {
    if (!["facilitator", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        error:
          "Solo los facilitadores y administradores pueden ver resultados de trivias",
      });
    }

    const { triviaId } = req.params;

    // Verificar que el maestro es propietario de la trivia
    const trivia = await Trivia.findById(triviaId);
    if (!trivia) {
      return res.status(404).json({ error: "Trivia no encontrada" });
    }

    if (trivia.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "No tienes permisos para ver estos resultados" });
    }

    const results = await Result.find({ trivia: triviaId })
      .populate({
        path: "user",
        select: "username email",
      })
      .populate({
        path: "answers.question",
        select: "text options correctAnswer",
      })
      .sort({ score: -1, createdAt: -1 });

    const statistics = {
      totalParticipants: results.length,
      averageScore:
        results.length > 0
          ? Math.round(
              (results.reduce((acc, r) => acc + r.score, 0) / results.length) *
                100
            ) / 100
          : 0,
      highestScore:
        results.length > 0 ? Math.max(...results.map((r) => r.score)) : 0,
      lowestScore:
        results.length > 0 ? Math.min(...results.map((r) => r.score)) : 0,
    };

    res.json({
      trivia: {
        id: trivia._id,
        title: trivia.title,
        totalQuestions: trivia.questions.length,
      },
      statistics,
      results: results.map((result) => ({
        id: result._id,
        student: result.user,
        score: result.score,
        percentage: Math.round((result.score / result.answers.length) * 100),
        completedAt: result.createdAt,
        answers: result.answers,
      })),
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
        select: "text options correctAnswer category difficulty",
      });

    if (!result) {
      return res.status(404).json({ error: "Resultado no encontrado" });
    }

    // Verificar permisos: el estudiante solo puede ver sus resultados,
    // el maestro puede ver resultados de sus trivias
    if (
      req.user.role === "user" &&
      result.user._id.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ error: "No tienes permisos para ver este resultado" });
    }

    if (["facilitator", "admin"].includes(req.user.role)) {
      const trivia = await Trivia.findById(result.trivia._id);
      if (trivia.createdBy.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ error: "No tienes permisos para ver este resultado" });
      }
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
