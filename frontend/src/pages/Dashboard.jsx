import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Plus,
  Users,
  BarChart3,
  Settings,
  Download,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit3,
} from "lucide-react";
import api from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const [trivias, setTrivias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTrivia, setSelectedTrivia] = useState(null);
  const [triviaResults, setTriviaResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  const [newTrivia, setNewTrivia] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    questions: [],
  });

  const [newQuestion, setNewQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    category: "",
    difficulty: "easy",
  });

  useEffect(() => {
    fetchMyTrivias();
  }, []);

  const fetchMyTrivias = async () => {
    try {
      setLoading(true);
      const response = await api.get("/trivia/my-trivias");
      setTrivias(response.data);
      console.log("Trivias cargadas:", response.data);
    } catch (error) {
      console.error("Error fetching trivias:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert(
        "Error al cargar trivias: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrivia = async (e) => {
    e.preventDefault();
    if (!newTrivia.title.trim()) return;

    try {
      const response = await api.post("/trivia/create", newTrivia);

      // Agregar preguntas si las hay
      if (newTrivia.questions.length > 0) {
        for (const question of newTrivia.questions) {
          await api.post(
            `/trivia/${response.data.trivia.id}/questions`,
            question
          );
        }
      }

      await fetchMyTrivias();
      setShowCreateForm(false);
      setNewTrivia({
        title: "",
        description: "",
        difficulty: "easy",
        questions: [],
      });
    } catch (error) {
      console.error("Error creating trivia:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert(
        "Error al crear la trivia: " +
          (error.response?.data?.error || error.message || "Error desconocido")
      );
    }
  };

  const addQuestion = () => {
    if (!newQuestion.text.trim() || newQuestion.correctAnswer === "") return;
    if (newQuestion.options.some((opt) => !opt.trim())) return;

    setNewTrivia((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...newQuestion }],
    }));

    setNewQuestion({
      text: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      category: "",
      difficulty: "easy",
    });
  };

  const removeQuestion = (index) => {
    setNewTrivia((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const toggleTrivia = async (triviaId) => {
    try {
      await api.patch(`/trivia/${triviaId}/toggle`);
      fetchMyTrivias();
    } catch (error) {
      console.error("Error toggling trivia:", error);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    // Aquí podrías mostrar una notificación
  };

  const fetchTriviaResults = async (triviaId) => {
    try {
      setLoadingResults(true);
      const response = await api.get(`/trivia/${triviaId}/results`);
      setTriviaResults(response.data);
      setSelectedTrivia(triviaId);
    } catch (error) {
      console.error("Error fetching results:", error);
      alert("Error al cargar los resultados");
    } finally {
      setLoadingResults(false);
    }
  };

  const downloadResults = async (triviaId) => {
    try {
      const response = await api.get(`/trivia/${triviaId}/results/download`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const filename =
        response.headers["content-disposition"]
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || `resultados_trivia_${triviaId}.csv`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading results:", error);
      alert("Error al descargar los resultados");
    }
  };

  if (!["admin", "facilitator"].includes(user?.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600">
            No tienes permisos para acceder al dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard{" "}
                {user?.role === "admin" ? "Administrador" : "Facilitador"}
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona tus trivias y ve los resultados
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Trivia
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Trivias
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {trivias.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activas</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {trivias.filter((t) => t.isActive).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user?.role === "admin" ? "Públicas" : "Privadas"}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {user?.role === "admin"
                    ? trivias.filter((t) => t.isPublic).length
                    : trivias.filter((t) => !t.isPublic).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trivias List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Mis Trivias</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando trivias...</p>
            </div>
          ) : trivias.length === 0 ? (
            <div className="p-8 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                No tienes trivias creadas aún
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Trivia
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {trivias.map((trivia) => (
                <div key={trivia._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {trivia.title}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trivia.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {trivia.isActive ? "Activa" : "Inactiva"}
                        </span>
                        {user?.role === "admin" && (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              trivia.isPublic
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {trivia.isPublic ? "Pública" : "Privada"}
                          </span>
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {trivia.difficulty === "easy"
                            ? "Fácil"
                            : trivia.difficulty === "medium"
                            ? "Medio"
                            : "Difícil"}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{trivia.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{trivia.questions.length} preguntas</span>
                        <span>•</span>
                        <span>Código: {trivia.code}</span>
                        <button
                          onClick={() => copyCode(trivia.code)}
                          className="inline-flex items-center text-amber-600 hover:text-amber-700"
                        >
                          <Copy className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => fetchTriviaResults(trivia._id)}
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Resultados
                      </button>
                      <button
                        onClick={() => downloadResults(trivia._id)}
                        className="inline-flex items-center px-3 py-1.5 text-sm bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Descargar
                      </button>
                      <button
                        onClick={() => toggleTrivia(trivia._id)}
                        className={`inline-flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          trivia.isActive
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        {trivia.isActive ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Activar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Modal */}
        {selectedTrivia && triviaResults && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Resultados: {triviaResults.trivia.title}
                </h2>
                <button
                  onClick={() => {
                    setSelectedTrivia(null);
                    setTriviaResults(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {loadingResults ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Cargando resultados...</p>
                  </div>
                ) : (
                  <>
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {triviaResults.summary.totalParticipants}
                        </p>
                        <p className="text-sm text-gray-600">
                          Total Participantes
                        </p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {triviaResults.summary.completedParticipants}
                        </p>
                        <p className="text-sm text-gray-600">Completaron</p>
                      </div>
                      <div className="text-center p-4 bg-amber-50 rounded-lg">
                        <p className="text-2xl font-bold text-amber-600">
                          {triviaResults.summary.averageScore}%
                        </p>
                        <p className="text-sm text-gray-600">Promedio</p>
                      </div>
                    </div>

                    {/* Results Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estudiante
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Puntaje
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              % Correcto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tiempo
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {triviaResults.results.map((result) => (
                            <tr key={result.userId}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {result.userName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {result.userEmail}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {result.correctAnswers}/{result.totalQuestions}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    result.percentage >= 70
                                      ? "bg-green-100 text-green-800"
                                      : result.percentage >= 50
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {result.percentage}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {result.completedAt
                                  ? "Completado"
                                  : "En progreso"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {result.timeTaken
                                  ? `${result.timeTaken} min`
                                  : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Create Trivia Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Crear Nueva Trivia
                </h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleCreateTrivia}
                className="p-6 overflow-y-auto"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título de la Trivia
                    </label>
                    <input
                      type="text"
                      value={newTrivia.title}
                      onChange={(e) =>
                        setNewTrivia((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={newTrivia.description}
                      onChange={(e) =>
                        setNewTrivia((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dificultad
                    </label>
                    <select
                      value={newTrivia.difficulty}
                      onChange={(e) =>
                        setNewTrivia((prev) => ({
                          ...prev,
                          difficulty: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="easy">Fácil</option>
                      <option value="medium">Medio</option>
                      <option value="hard">Difícil</option>
                    </select>
                  </div>

                  {/* Questions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Preguntas ({newTrivia.questions.length})
                      </label>
                    </div>

                    {/* Add Question Form */}
                    <div className="border border-gray-200 rounded-lg p-4 mb-4">
                      <input
                        type="text"
                        placeholder="Texto de la pregunta"
                        value={newQuestion.text}
                        onChange={(e) =>
                          setNewQuestion((prev) => ({
                            ...prev,
                            text: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                      />

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {newQuestion.options.map((option, index) => (
                          <input
                            key={index}
                            type="text"
                            placeholder={`Opción ${index + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options];
                              newOptions[index] = e.target.value;
                              setNewQuestion((prev) => ({
                                ...prev,
                                options: newOptions,
                              }));
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        ))}
                      </div>

                      <div className="flex space-x-3 mb-3">
                        <select
                          value={newQuestion.correctAnswer}
                          onChange={(e) =>
                            setNewQuestion((prev) => ({
                              ...prev,
                              correctAnswer: parseInt(e.target.value),
                            }))
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option value="">
                            Selecciona la respuesta correcta
                          </option>
                          {newQuestion.options.map((option, index) => (
                            <option key={index} value={index}>
                              {index + 1}. {option || `Opción ${index + 1}`}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Categoría"
                          value={newQuestion.category}
                          onChange={(e) =>
                            setNewQuestion((prev) => ({
                              ...prev,
                              category: e.target.value,
                            }))
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        Agregar Pregunta
                      </button>
                    </div>

                    {/* Questions List */}
                    {newTrivia.questions.length > 0 && (
                      <div className="space-y-2">
                        {newTrivia.questions.map((question, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-3 flex justify-between items-start"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{question.text}</p>
                              <p className="text-sm text-gray-600">
                                Respuesta:{" "}
                                {question.options[question.correctAnswer]}{" "}
                                (Opción {question.correctAnswer + 1})
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeQuestion(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                  >
                    Crear Trivia
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
