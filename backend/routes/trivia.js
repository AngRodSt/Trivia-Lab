import { Router } from "express";
import Trivia from "../models/Trivia.js";
import Question from "../models/Questions.js";
import Result from "../models/Result.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Obtener todas las trivias disponibles (solo públicas para usuarios no autenticados)
router.get("/", async (req, res) => {
  try {
    // Solo mostrar trivias públicas en la lista general
    const trivias = await Trivia.find({ isActive: true, isPublic: true })
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

// Crear una nueva trivia (admins y facilitators)
router.post("/create", authenticateToken, async (req, res) => {
  try {
    if (!["admin", "facilitator"].includes(req.user.role)) {
      return res.status(403).json({
        error: "Solo los administradores y facilitadores pueden crear trivias",
      });
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

    // Las trivias de admin son públicas por defecto, las de facilitators son privadas
    const isPublic = req.user.role === "admin";

    const trivia = new Trivia({
      title,
      description,
      code,
      difficulty,
      createdBy: req.user._id,
      questions: [],
      isPublic,
      allowDownloadResults: true,
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

// Obtener trivias del usuario autenticado (admin o facilitator)
router.get("/my-trivias", authenticateToken, async (req, res) => {
  try {
    if (!["admin", "facilitator"].includes(req.user.role)) {
      return res.status(403).json({
        error:
          "Solo los administradores y facilitadores pueden ver sus trivias",
      });
    }

    const trivias = await Trivia.find({ createdBy: req.user._id })
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

    const trivia = await Trivia.findOne({ code, isActive: true }).populate(
      "questions"
    );

    if (!trivia) {
      return res.status(404).json({ error: "Trivia no encontrada o inactiva" });
    }

    res.json({
      id: trivia._id,
      title: trivia.title,
      description: trivia.description,
      questions: trivia.questions.map((q) => ({
        _id: q._id,
        text: q.text,
        options: q.options,
        category: q.category,
        difficulty: q.difficulty,
        // No incluimos correctAnswer por seguridad
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener trivia específica por ID
router.get("/:id", async (req, res) => {
  try {
    // Verificar si es un ObjectId válido
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "ID de trivia inválido" });
    }

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
    // Verificar si es un ObjectId válido
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "ID de trivia inválido" });
    }

    const trivia = await Trivia.findById(req.params.id).populate("questions");

    if (!trivia) {
      return res.status(404).json({ error: "Trivia no encontrada" });
    }

    if (!trivia.isActive) {
      return res.status(400).json({ error: "Esta trivia no está disponible" });
    }

    // Crear o actualizar el resultado para este usuario
    let result = await Result.findOne({
      user: req.user._id,
      trivia: trivia._id,
    });

    if (!result) {
      result = new Result({
        user: req.user._id,
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

    // Verificar si es un ObjectId válido
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "ID de trivia inválido" });
    }

    const trivia = await Trivia.findById(req.params.id);
    const question = await Question.findById(questionId);

    if (!trivia || !question) {
      return res.status(404).json({ error: "Trivia o pregunta no encontrada" });
    }

    // Buscar el resultado del usuario
    let result = await Result.findOne({
      user: req.user._id,
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
    // Verificar si es un ObjectId válido
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "ID de trivia inválido" });
    }

    const result = await Result.findOne({
      user: req.user._id,
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

// Agregar pregunta a una trivia existente
router.post("/:id/questions", authenticateToken, async (req, res) => {
  try {
    // Verificar si es un ObjectId válido
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "ID de trivia inválido" });
    }

    const trivia = await Trivia.findById(req.params.id);

    if (!trivia) {
      return res.status(404).json({ error: "Trivia no encontrada" });
    }

    if (trivia.createdBy.toString() !== req.user._id.toString()) {
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
    // Verificar si es un ObjectId válido
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "ID de trivia inválido" });
    }

    const trivia = await Trivia.findById(req.params.id);

    if (!trivia) {
      return res.status(404).json({ error: "Trivia no encontrada" });
    }

    if (trivia.createdBy.toString() !== req.user._id.toString()) {
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

// Obtener resultados de una trivia (solo creador)
router.get("/:id/results", authenticateToken, async (req, res) => {
  try {
    // Verificar si es un ObjectId válido
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "ID de trivia inválido" });
    }

    const trivia = await Trivia.findById(req.params.id);

    if (!trivia) {
      return res.status(404).json({ error: "Trivia no encontrada" });
    }

    if (trivia.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "No tienes permisos para ver los resultados de esta trivia",
      });
    }

    const results = await Result.find({ trivia: req.params.id })
      .populate("user", "name email")
      .populate("trivia", "title questions")
      .sort({ completedAt: -1 });

    const processedResults = results.map((result) => ({
      userId: result.user._id,
      userName: result.user.name,
      userEmail: result.user.email,
      score: result.score,
      totalQuestions: result.trivia.questions.length,
      correctAnswers: result.answers.filter((a) => a.isCorrect).length,
      percentage: Math.round(
        (result.score / (result.trivia.questions.length * 100)) * 100
      ),
      completedAt: result.completedAt,
      timeStarted: result.timeStarted,
      timeTaken: result.completedAt
        ? Math.round(
            (new Date(result.completedAt) - new Date(result.timeStarted)) /
              1000 /
              60
          )
        : null,
      answers: result.answers,
    }));

    res.json({
      trivia: {
        id: trivia._id,
        title: trivia.title,
        totalQuestions: trivia.questions.length,
      },
      results: processedResults,
      summary: {
        totalParticipants: results.length,
        completedParticipants: results.filter((r) => r.completedAt).length,
        averageScore:
          processedResults.length > 0
            ? Math.round(
                processedResults.reduce((sum, r) => sum + r.percentage, 0) /
                  processedResults.length
              )
            : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Descargar resultados en formato CSV
router.get("/:id/results/download", authenticateToken, async (req, res) => {
  try {
    // Verificar si es un ObjectId válido
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "ID de trivia inválido" });
    }

    const trivia = await Trivia.findById(req.params.id);

    if (!trivia) {
      return res.status(404).json({ error: "Trivia no encontrada" });
    }

    if (
      trivia.createdBy.toString() !== req.user._id.toString() ||
      !trivia.allowDownloadResults
    ) {
      return res.status(403).json({
        error:
          "No tienes permisos para descargar los resultados de esta trivia",
      });
    }

    const results = await Result.find({ trivia: req.params.id })
      .populate("user", "name email")
      .populate("trivia", "title questions")
      .sort({ completedAt: -1 });

    // Crear CSV
    const csvHeaders = [
      "Nombre del Estudiante",
      "Email",
      "Puntaje",
      "Preguntas Correctas",
      "Total Preguntas",
      "Porcentaje",
      "Tiempo de Inicio",
      "Tiempo de Finalización",
      "Tiempo Transcurrido (min)",
      "Estado",
    ];

    const csvRows = results.map((result) => {
      const correctAnswers = result.answers.filter((a) => a.isCorrect).length;
      const totalQuestions = result.trivia.questions.length;
      const percentage = Math.round(
        (result.score / (totalQuestions * 100)) * 100
      );
      const timeTaken = result.completedAt
        ? Math.round(
            (new Date(result.completedAt) - new Date(result.timeStarted)) /
              1000 /
              60
          )
        : "N/A";

      return [
        result.user.name,
        result.user.email,
        result.score,
        correctAnswers,
        totalQuestions,
        `${percentage}%`,
        new Date(result.timeStarted).toLocaleString("es-ES"),
        result.completedAt
          ? new Date(result.completedAt).toLocaleString("es-ES")
          : "No completado",
        timeTaken,
        result.completedAt ? "Completado" : "En progreso",
      ];
    });

    const csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="resultados_${trivia.title.replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )}_${Date.now()}.csv"`
    );
    res.send("\ufeff" + csvContent); // BOM para UTF-8
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
