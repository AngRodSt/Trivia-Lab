import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTrivia } from "../hooks/useTrivia";
import { useAuth } from "../hooks/useAuth";
import { resultsAPI } from "../services/api";
import JoinTriviaByCode from "../components/JoinTriviaByCode";
import {
  Play,
  Clock,
  Users,
  Trophy,
  Star,
  Filter,
  Search,
  BookOpen,
  Atom,
  Zap,
  Globe,
  Gamepad2,
  Palette,
  Music,
  Laptop,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Database,
  Shield,
  Monitor,
  Settings,
  Code,
} from "lucide-react";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const triviasPerPage = 20;
  const { trivias, loading, error, loadTrivias } = useTrivia();
  const { user } = useAuth();
  const navigate = useNavigate();
  console.log("Trivias cargadas:", trivias);
  useEffect(() => {
    loadTrivias();
    loadUserStats();
  }, [loadTrivias]);

  const loadUserStats = async () => {
    try {
      setLoadingStats(true);
      const stats = await resultsAPI.getMyStats();
      setUserStats(stats);
    } catch (error) {
      console.error("Error loading user stats:", error);
      setUserStats({
        triviasCompleted: 0,
        totalScore: 0,
        bestScore: 0,
        globalRank: null,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const categories = [
    "all",
    "Programación",
    "Bases de Datos",
    "Redes",
    "Sistemas Operativos",
    "Seguridad Informática",
    "Inteligencia Artificial",
    "Desarrollo Web",
    "Ingeniería de Software",
    "Hardware",
    "Historia de la Computación",
  ];

  const filteredTrivias = trivias.filter((trivia) => {
    // Debug: Log trivia data to check structure
    if (trivias.length > 0 && trivias.indexOf(trivia) === 0) {
      console.log("Primera trivia para debug:", trivia);
      console.log("Dificultad:", trivia.difficulty);
      console.log("Categorías:", trivia.categories);
    }

    const matchesSearch =
      trivia.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trivia.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      (trivia.categories &&
        trivia.categories.some(
          (cat) => cat.toLowerCase() === selectedCategory.toLowerCase()
        ));
    const matchesDifficulty =
      selectedDifficulty === "all" || trivia.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Lógica de paginación
  const totalPages = Math.ceil(filteredTrivias.length / triviasPerPage);
  const startIndex = (currentPage - 1) * triviasPerPage;
  const endIndex = startIndex + triviasPerPage;
  const currentTrivias = filteredTrivias.slice(startIndex, endIndex);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const handlePlayTrivia = (triviaId) => {
    navigate(`/trivia/${triviaId}`);
  };

  const getDifficultyColor = (difficulty) => {
    if (!difficulty) return "text-gray-700 bg-gray-200 border border-gray-300";

    switch (difficulty) {
      case "hard":
        return "text-red-700 bg-red-100 border border-red-300";
      case "medium":
        return "text-orange-700 bg-orange-100 border border-orange-300";
      case "easy":
        return "text-green-700 bg-green-100 border border-green-300";
      default:
        return "text-gray-700 bg-gray-200 border border-gray-300";
    }
  };

  const getDifficultyText = (difficulty) => {
    if (!difficulty) return "Variada";

    switch (difficulty) {
      case "easy":
        return "Fácil";
      case "medium":
        return "Medio";
      case "hard":
        return "Difícil";
      default:
        return "Variada";
    }
  };

  const getCategoryIcon = (categories) => {
    if (!categories || categories.length === 0)
      return <BookOpen className="w-5 h-5" />;

    // Usar la primera categoría para el icono
    const category = categories[0].toLowerCase();
    switch (category) {
      case "programación":
        return <Code className="w-5 h-5" />;
      case "bases de datos":
        return <Database className="w-5 h-5" />;
      case "redes":
        return <Globe className="w-5 h-5" />;
      case "sistemas operativos":
        return <Monitor className="w-5 h-5" />;
      case "seguridad informática":
        return <Shield className="w-5 h-5" />;
      case "inteligencia artificial":
        return <Atom className="w-5 h-5" />;
      case "desarrollo web":
        return <Globe className="w-5 h-5" />;
      case "ingeniería de software":
        return <Settings className="w-5 h-5" />;
      case "hardware":
        return <Laptop className="w-5 h-5" />;
      case "historia de la computación":
        return <BookOpen className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando trivias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-50 py-8">
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 xl:px-20">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Users className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Bienvenido, {user?.name || "Usuario"}
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Desafía tu conocimiento con nuestras trivias interactivas y compite
            con otros jugadores
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br bg-black rounded-xl inline-block mb-6">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Trivias Completadas
              </p>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {loadingStats ? "..." : userStats?.triviasCompleted || 0}
              </p>
              <p className="text-sm text-gray-600">
                {(userStats?.triviasCompleted || 0) > 0
                  ? "¡Sigue así!"
                  : "¡Comienza tu primera trivia!"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br bg-amber-400 rounded-2xl inline-block mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Mejor Puntuación
              </p>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {loadingStats ? "..." : userStats?.bestScore || 0}
              </p>
              <p className="text-sm text-gray-600">
                {(userStats?.bestScore || 0) > 0
                  ? "¡Excelente resultado!"
                  : "Tu récord aparecerá aquí"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br bg-black rounded-2xl inline-block mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Posición Global
              </p>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {loadingStats
                  ? "..."
                  : userStats?.globalRank
                  ? `#${userStats.globalRank}`
                  : "--"}
              </p>
              <p className="text-sm text-gray-600">
                {userStats?.globalRank
                  ? "En el ranking mundial"
                  : "Completa una trivia para aparecer"}
              </p>
            </div>
          </div>
        </div>

        {/* Join by Code Section - Only for regular users */}
        {user?.role === "user" && (
          <div className="mb-12">
            <JoinTriviaByCode />
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-gray-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Buscar y Filtrar
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar trivia
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="all">Todas las categorías</option>
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dificultad
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="all">Todas las dificultades</option>
                <option value="easy">Fácil</option>
                <option value="medium">Medio</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trivia Grid */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {filteredTrivias.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-4 bg-gray-100 rounded-full inline-block mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron trivias
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Intenta cambiar los filtros de búsqueda o explora diferentes
              categorías
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentTrivias.map((trivia) => (
              <div
                key={trivia._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      {getCategoryIcon(trivia.categories)}
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getDifficultyColor(
                        trivia.difficulty
                      )}`}
                    >
                      {getDifficultyText(trivia.difficulty)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {trivia.title}
                  </h3>

                  <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                    {trivia.description ||
                      "Pon a prueba tus conocimientos con esta interesante trivia."}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                      <span>Sin límite</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                      <span>{trivia.questionsCount || 0} preguntas</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlayTrivia(trivia._id)}
                    className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r bg-black hover:bg-amber-400 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Comenzar Trivia
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {filteredTrivias.length > triviasPerPage && (
          <div className="mt-12 flex items-center justify-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                const isCurrentPage = page === currentPage;

                // Mostrar solo algunas páginas alrededor de la actual
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        isCurrentPage
                          ? "bg-black text-white shadow-md"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  page === currentPage - 3 ||
                  page === currentPage + 3
                ) {
                  return (
                    <span key={page} className="px-2 py-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
              }`}
            >
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}

        {/* Información de paginación */}
        {filteredTrivias.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-600">
            Mostrando {startIndex + 1} -{" "}
            {Math.min(endIndex, filteredTrivias.length)} de{" "}
            {filteredTrivias.length} trivias
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
