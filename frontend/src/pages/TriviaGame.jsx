import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTrivia } from "../hooks/useTrivia";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Flag,
  CheckCircle,
  XCircle,
} from "lucide-react";

const TriviaGame = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentTrivia,
    currentQuestion,
    answers,
    score,
    timeRemaining,
    isPlaying,
    isCompleted,
    loading,
    error,
    loadTrivia,
    startTrivia,
    nextQuestion,
    submitAnswer,
    completeTrivia,
    resetTrivia,
  } = useTrivia();

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeWarningShown, setTimeWarningShown] = useState({
    5: false,
    2: false,
    1: false,
  });

  useEffect(() => {
    if (id) {
      loadTrivia(id);
    }
    return () => {
      resetTrivia();
    };
  }, [id, loadTrivia, resetTrivia]);

  // Efecto para mostrar advertencias de tiempo
  useEffect(() => {
    if (timeRemaining !== null && isPlaying) {
      const minutes = Math.floor(timeRemaining / 60);

      // Mostrar advertencia cuando quedan 5, 2 o 1 minuto
      if (minutes === 5 && !timeWarningShown[5] && timeRemaining <= 300) {
        setTimeWarningShown((prev) => ({ ...prev, 5: true }));
        // Aquí podrías agregar una notificación toast
      } else if (
        minutes === 2 &&
        !timeWarningShown[2] &&
        timeRemaining <= 120
      ) {
        setTimeWarningShown((prev) => ({ ...prev, 2: true }));
      } else if (minutes === 1 && !timeWarningShown[1] && timeRemaining <= 60) {
        setTimeWarningShown((prev) => ({ ...prev, 1: true }));
      }
    }
  }, [timeRemaining, isPlaying, timeWarningShown]);

  const handleStartTrivia = () => {
    startTrivia(id);
  };

  const handleAnswerSelect = async (answerIndex) => {
    if (showResult) return; // No permitir cambios si ya se mostró el resultado

    setSelectedAnswer(answerIndex);

    // Enviar respuesta automáticamente
    try {
      const currentQ = currentTrivia.questions?.[currentQuestion];
      if (!currentQ) {
        console.error("Pregunta no encontrada");
        return;
      }
      await submitAnswer(currentQ._id, answerIndex);
      setShowResult(true);

      // Auto-avanzar después de mostrar el resultado
      setTimeout(() => {
        setShowResult(false);
        setSelectedAnswer(null);

        if (currentQuestion < currentTrivia.questions.length - 1) {
          nextQuestion();
        } else {
          completeTrivia();
        }
      }, 2500);
    } catch (error) {
      console.error("Error submitting answer:", error);
      setSelectedAnswer(null);
    }
  };

  const handlePlayAgain = () => {
    resetTrivia();
    navigate("/");
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getAnswerStatus = (answerIndex) => {
    if (!showResult) {
      return selectedAnswer === answerIndex ? "selected" : "";
    }

    const lastResult = answers[answers.length - 1]; // La última respuesta enviada

    if (lastResult && lastResult.correctAnswer === answerIndex) {
      return "correct";
    } else if (
      answerIndex === selectedAnswer &&
      lastResult &&
      lastResult.correctAnswer !== answerIndex
    ) {
      return "incorrect";
    }
    return "";
  };

  const getAnswerClasses = (status) => {
    const baseClasses =
      "w-full p-5 text-left border-2 rounded-xl transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5";

    switch (status) {
      case "selected":
        return `${baseClasses} border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg`;
      case "correct":
        return `${baseClasses} border-green-500 bg-gradient-to-r from-green-50 to-green-100 text-green-800 shadow-lg`;
      case "incorrect":
        return `${baseClasses} border-red-500 bg-gradient-to-r from-red-50 to-red-100 text-red-800 shadow-lg`;
      default:
        return `${baseClasses} border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-amber-100 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-800"></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Cargando trivia
          </h3>
          <p className="text-gray-600">Preparando las preguntas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Error al cargar la trivia
          </h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 px-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (!currentTrivia) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">❓</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Trivia no encontrada
          </h2>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Trivia completada
  if (isCompleted) {
    const percentage = Math.round(
      (score / (currentTrivia.questions.length * 100)) * 100
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center">
            <div className="mb-8">
              {percentage >= 80 ? (
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mb-4">
                  <Flag className="w-12 h-12 text-white" />
                </div>
              ) : percentage >= 60 ? (
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              ) : (
                <div className="w-24 h-24 mx-auto bg-black rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
              )}
            </div>

            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              {timeRemaining === 0 ? "¡Tiempo Agotado!" : "¡Trivia Completada!"}
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              {timeRemaining === 0
                ? `Se agotó el tiempo en "${currentTrivia.title}"`
                : `Has terminado "${currentTrivia.title}"`}
            </p>

            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
                <div className="text-3xl font-bold text-amber-700 mb-1">
                  {score}
                </div>
                <div className="text-sm font-semibold text-amber-600 uppercase tracking-wide">
                  Puntuación Total
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <div className="text-3xl font-bold text-gray-700 mb-1">
                  {percentage}%
                </div>
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Aciertos
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handlePlayAgain}
                className="w-full py-4 px-8 bg-gradient-to-r from-black to-gray-800 hover:from-amber-400 hover:to-amber-500 text-white font-semibold rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Jugar Otra Trivia
                </div>
              </button>
              <button
                onClick={() => navigate("/leaderboard")}
                className="w-full py-4 px-8 bg-white hover:bg-amber-50 text-gray-700 font-semibold border-2 border-gray-200 hover:border-amber-400 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-center">
                  <Flag className="w-5 h-5 mr-2" />
                  Ver Ranking
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de inicio de trivia
  if (!isPlaying) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-gray-600 hover:text-amber-700 mb-8 transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Volver al inicio</span>
            </button>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br bg-amber-400 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {currentTrivia.title}
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                {currentTrivia.description}
              </p>

              <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
                  <div className="w-12 h-12 mx-auto bg-amber-500 rounded-xl flex items-center justify-center mb-3">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-amber-700 mb-1">
                    {currentTrivia.questions.length}
                  </div>
                  <div className="text-sm font-semibold text-amber-600 uppercase tracking-wide">
                    Preguntas
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
                  <div className="w-12 h-12 mx-auto bg-amber-500 rounded-xl flex items-center justify-center mb-3">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-amber-700 mb-1">
                    {currentTrivia.timeLimit
                      ? `${currentTrivia.timeLimit}min`
                      : "∞"}
                  </div>
                  <div className="text-sm font-semibold text-amber-600 uppercase tracking-wide">
                    Tiempo
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartTrivia}
                className="w-full py-4 px-8 bg-gradient-to-r bg-black hover:bg-amber-400  text-white font-bold text-lg rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl"
              >
                <div className="flex items-center justify-center">
                  <Flag className="w-6 h-6 mr-3" />
                  Comenzar Trivia
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game screen
  const currentQ = currentTrivia.questions?.[currentQuestion];

  // Verificar que currentQ existe antes de continuar
  if (!currentQ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando pregunta...</p>
          <p className="text-sm text-gray-500 mt-2">
            Pregunta {currentQuestion + 1} de{" "}
            {currentTrivia.questions?.length || 0}
          </p>
        </div>
      </div>
    );
  }

  const progress =
    ((currentQuestion + 1) / currentTrivia.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Pregunta
                  </span>
                  <div className="text-lg font-bold text-gray-900">
                    {currentQuestion + 1} de {currentTrivia.questions.length}
                  </div>
                </div>
              </div>

              {timeRemaining !== null && (
                <div className="flex items-center space-x-2">
                  <div
                    className={`p-2 rounded-lg ${
                      timeRemaining < 60
                        ? "bg-red-100"
                        : timeRemaining < 300
                        ? "bg-orange-100"
                        : "bg-green-100"
                    }`}
                  >
                    <Clock
                      className={`w-5 h-5 ${
                        timeRemaining < 60
                          ? "text-red-600"
                          : timeRemaining < 300
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Tiempo Restante
                    </span>
                    <div
                      className={`text-lg font-bold ${
                        timeRemaining < 60
                          ? "text-red-600"
                          : timeRemaining < 300
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatTime(timeRemaining)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Puntuación
              </span>
              <div className="text-2xl font-bold text-amber-600">{score}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-amber-400 to-amber-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Inicio</span>
            <span>{Math.round(progress)}% completado</span>
            <span>Final</span>
          </div>

          {/* Time Progress Bar */}
          {timeRemaining !== null && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ease-linear ${
                    timeRemaining < 60
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : timeRemaining < 300
                      ? "bg-gradient-to-r from-orange-400 to-orange-500"
                      : "bg-gradient-to-r from-green-400 to-green-500"
                  }`}
                  style={{
                    width: `${
                      currentTrivia.timeLimit
                        ? (timeRemaining / (currentTrivia.timeLimit * 60)) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Tiempo agotado</span>
                <span>Tiempo inicial</span>
              </div>
            </div>
          )}
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
              {currentQ.text}
            </h2>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
                {currentQ.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium capitalize">
                {currentQ.difficulty}
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showResult}
                className={getAnswerClasses(getAnswerStatus(index))}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full font-bold text-gray-600 mr-4">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-left">{option}</span>
                  </div>
                  {showResult && getAnswerStatus(index) === "correct" && (
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                  {showResult && getAnswerStatus(index) === "incorrect" && (
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Feedback Message */}
          {showResult && (
            <div className="text-center mb-8">
              {getAnswerStatus(selectedAnswer) === "correct" ? (
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-xl border border-green-300">
                  <div className="p-1 bg-green-600 rounded-full mr-3">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">¡Correcto! +100 puntos</span>
                </div>
              ) : (
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-100 to-red-200 text-red-800 rounded-xl border border-red-300">
                  <div className="p-1 bg-red-600 rounded-full mr-3">
                    <XCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold">Respuesta incorrecta</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TriviaGame;
