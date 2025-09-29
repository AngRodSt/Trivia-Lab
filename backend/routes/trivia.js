import { Router } from "express";
import Trivia from "../models/Trivia.js";
import Question from "../models/Questions.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Crear una nueva trivia (solo maestros)
router.post("/create", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "maestro") {
      return res.status(403).json({ error: "Solo los maestros pueden crear trivias" });
    }

    const { title, description, questions } = req.body;
    
    // Generar código único de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const trivia = new Trivia({
      title,
      description,
      code,
      createdBy: req.user.id,
      questions: []
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
          trivia: trivia._id
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
        questionsCount: trivia.questions.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener trivias del maestro
router.get("/my-trivias", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "maestro") {
      return res.status(403).json({ error: "Solo los maestros pueden ver sus trivias" });
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
    
    const trivia = await Trivia.findOne({ code, isActive: true })
      .populate({
        path: "questions",
        select: "text options category difficulty -correctAnswer" // No enviar la respuesta correcta
      });

    if (!trivia) {
      return res.status(404).json({ error: "Trivia no encontrada o inactiva" });
    }

    res.json({
      id: trivia._id,
      title: trivia.title,
      description: trivia.description,
      questions: trivia.questions
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
      return res.status(403).json({ error: "No tienes permisos para editar esta trivia" });
    }

    const { text, options, correctAnswer, category, difficulty } = req.body;
    
    const question = new Question({
      text,
      options,
      correctAnswer,
      category,
      difficulty,
      trivia: trivia._id
    });

    await question.save();
    
    trivia.questions.push(question._id);
    await trivia.save();

    res.status(201).json({ message: "Pregunta agregada exitosamente", question });
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
      return res.status(403).json({ error: "No tienes permisos para editar esta trivia" });
    }

    trivia.isActive = !trivia.isActive;
    await trivia.save();

    res.json({ 
      message: `Trivia ${trivia.isActive ? 'activada' : 'desactivada'} exitosamente`,
      isActive: trivia.isActive 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;