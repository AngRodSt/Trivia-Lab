import { Router } from "express";
import Trivia from "../models/Trivia.js";
import Question from "../models/Questions.js";
import Result from "../models/Result.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Obtener todas las trivias disponibles (público/usuarios autenticados)
router.get("/", async (req, res) => {
  try {
    const trivias = await Trivia.find({ isActive: true })
      .populate("createdBy", "name")
      .populate("questions", "category difficulty")
      .sort({ createdAt: -1 });

    const triviasWithStats = trivias.map((trivia) => ({
      _id: trivia._id,
      title: trivia.title,
      description: trivia.description,
      code: trivia.code,
      difficulty: trivia.difficulty,
      createdBy: trivia.createdBy,
      questions: trivia.questions,
      questionsCount: trivia.questions.length,
      categories: [...new Set(trivia.questions.map((q) => q.category))],
      createdAt: trivia.createdAt,
    }));

    res.json(triviasWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener trivia específica por ID
router.get("/:id", async (req, res) => {
  try {
    const trivia = await Trivia.findById(req.params.id)
      .populate("createdBy", "name")
      .populate("questions");

    if (!trivia) {
      return res.status(404).json({ error: "Trivia no encontrada" });
    }

    if (!trivia.isActive) {
      return res.status(400).json({ error: "Esta trivia no está disponible" });
    }

    res.json(trivia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar sesión de trivia
router.post("/:id/start", authenticateToken, async (req, res) => {
  try {
    const trivia = await Trivia.findById(req.params.id).populate("questions");

    if (!trivia) {
      return res.status(404).json({ error: "Trivia no encontrada" });
    }

    if (!trivia.isActive) {
      return res.status(400).json({ error: "Esta trivia no está disponible" });
    }

    // Crear o actualizar el resultado para este usuario
    let result = await Result.findOne({
      user: req.user.id,
      trivia: trivia._id,
    });

    if (!result) {
      result = new Result({
        user: req.user.id,
        trivia: trivia._id,
        answers: [],
        score: 0,
        completedAt: null,
        timeStarted: new Date(),
      });
      await result.save();
    }

    res.json({
      message: "Trivia iniciada",
      sessionId: result._id,
      trivia: {
        _id: trivia._id,
        title: trivia.title,
        description: trivia.description,
        questions: trivia.questions.map((q) => ({
          _id: q._id,
          text: q.text,
          options: q.options,
          category: q.category,
          difficulty: q.difficulty,
          // No enviamos correctAnswer por seguridad
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enviar respuesta
router.post("/:id/answer", authenticateToken, async (req, res) => {
  try {
    const { questionId, answer } = req.body;

    const trivia = await Trivia.findById(req.params.id);
    const question = await Question.findById(questionId);

    if (!trivia || !question) {
      return res.status(404).json({ error: "Trivia o pregunta no encontrada" });
    }

    // Buscar el resultado del usuario
    let result = await Result.findOne({
      user: req.user.id,
      trivia: trivia._id,
    });

    if (!result) {
      return res.status(400).json({ error: "Sesión de trivia no encontrada" });
    }

    // Verificar si la respuesta es correcta
    const isCorrect = question.correctAnswer === answer;
    const points = isCorrect ? 100 : 0; // 100 puntos por respuesta correcta

    // Actualizar o agregar la respuesta
    const existingAnswerIndex = result.answers.findIndex(
      (a) => a.questionId.toString() === questionId
    );

    const answerData = {
      questionId,
      selectedAnswer: answer,
      isCorrect,
      points,
    };

    if (existingAnswerIndex >= 0) {
      // Actualizar respuesta existente
      const oldPoints = result.answers[existingAnswerIndex].points;
      result.answers[existingAnswerIndex] = answerData;
      result.score = result.score - oldPoints + points;
    } else {
      // Nueva respuesta
      result.answers.push(answerData);
      result.score += points;
    }

    await result.save();

    res.json({
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      points,
      totalScore: result.score,
      explanation: question.explanation || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Completar trivia
router.post("/:id/complete", authenticateToken, async (req, res) => {
  try {
    const result = await Result.findOne({
      user: req.user.id,
      trivia: req.params.id,
    }).populate("trivia", "title questions");

    if (!result) {
      return res.status(400).json({ error: "Sesión de trivia no encontrada" });
    }

    result.completedAt = new Date();
    await result.save();

    res.json({
      message: "Trivia completada",
      result: {
        score: result.score,
        totalQuestions: result.trivia.questions.length,
        correctAnswers: result.answers.filter((a) => a.isCorrect).length,
        percentage: Math.round(
          (result.score / (result.trivia.questions.length * 100)) * 100
        ),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
!MODIFICAR: HABILITAAR QUE PROFESORES PUEDAN CREAR TRIVIAS
*/
// Crear una nueva trivia (solo admins)
router.post("/create", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Solo los administradores pueden crear trivias" });
    }

    const { title, description, difficulty, questions } = req.body;

    // Validar que la dificultad sea válida
    if (!difficulty || !["easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).json({
        error: "La dificultad debe ser 'easy', 'medium' o 'hard'",
      });
    }

    // Generar código único de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const trivia = new Trivia({
      title,
      description,
      code,
      difficulty,
      createdBy: req.user.id,
      questions: [],
    });

    await trivia.save();

    // Si se proporcionaron preguntas, crearlas
    if (questions && questions.length > 0) {
      const createdQuestions = [];
      for (const q of questions) {
        const question = new Question({
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          category: q.category,
          difficulty: q.difficulty,
          trivia: trivia._id,
        });
        await question.save();
        createdQuestions.push(question._id);
      }

      trivia.questions = createdQuestions;
      await trivia.save();
    }

    res.status(201).json({
      message: "Trivia creada exitosamente",
      trivia: {
        id: trivia._id,
        title: trivia.title,
        code: trivia.code,
        questionsCount: trivia.questions.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener trivias del administrador
router.get("/my-trivias", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Solo los administradores pueden ver sus trivias" });
    }

    const trivias = await Trivia.find({ createdBy: req.user.id })
      .populate("questions")
      .sort({ createdAt: -1 });

    res.json(trivias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener trivia por código (para estudiantes)
router.get("/join/:code", authenticateToken, async (req, res) => {
  try {
    const { code } = req.params;

    const trivia = await Trivia.findOne({ code, isActive: true }).populate({
      path: "questions",
      select: "text options category difficulty -correctAnswer", // No enviar la respuesta correcta
    });

    if (!trivia) {
      return res.status(404).json({ error: "Trivia no encontrada o inactiva" });
    }

    res.json({
      id: trivia._id,
      title: trivia.title,
      description: trivia.description,
      questions: trivia.questions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar pregunta a una trivia existente
router.post("/:id/questions", authenticateToken, async (req, res) => {
  try {
    const trivia = await Trivia.findById(req.params.id);

    if (!trivia) {
      return res.status(404).json({ error: "Trivia no encontrada" });
    }

    if (trivia.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "No tienes permisos para editar esta trivia" });
    }

    const { text, options, correctAnswer, category, difficulty } = req.body;

    const question = new Question({
      text,
      options,
      correctAnswer,
      category,
      difficulty,
      trivia: trivia._id,
    });

    await question.save();

    trivia.questions.push(question._id);
    await trivia.save();

    res
      .status(201)
      .json({ message: "Pregunta agregada exitosamente", question });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activar/Desactivar trivia
router.patch("/:id/toggle", authenticateToken, async (req, res) => {
  try {
    const trivia = await Trivia.findById(req.params.id);

    if (!trivia) {
      return res.status(404).json({ error: "Trivia no encontrada" });
    }

    if (trivia.createdBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "No tienes permisos para editar esta trivia" });
    }

    trivia.isActive = !trivia.isActive;
    await trivia.save();

    res.json({
      message: `Trivia ${
        trivia.isActive ? "activada" : "desactivada"
      } exitosamente`,
      isActive: trivia.isActive,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
