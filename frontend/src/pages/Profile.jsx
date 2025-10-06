import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { resultsAPI } from "../services/api";
import {
  User,
  Mail,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Shield,
  GraduationCap,
  UserCheck,
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserData = async () => {
    try {
      setLoading(true);
      if (user?._id) {
        const results = await resultsAPI.getUserResults(user._id);
        setRecentResults(results);

        // Calculate user stats
        const stats = calculateStats(results);
        setUserStats(stats);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (results) => {
    if (!results || results.length === 0) {
      return {
        totalTrivias: 0,
        totalScore: 0,
        averageScore: 0,
        bestScore: 0,
        totalTime: 0,
        streak: 0,
      };
    }

    const totalTrivias = results.length;
    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    const averageScore = Math.round(totalScore / totalTrivias);
    const bestScore = Math.max(...results.map((result) => result.score));
    const totalTime = results.reduce(
      (sum, result) => sum + (result.timeSpent || 0),
      0
    );

    // Calculate streak (consecutive days with completed trivias)
    const dates = results.map((result) =>
      new Date(result.createdAt).toDateString()
    );
    const uniqueDates = [...new Set(dates)].sort();
    let streak = 0;
    const today = new Date().toDateString();

    if (uniqueDates.includes(today)) {
      streak = 1;
      for (let i = uniqueDates.length - 2; i >= 0; i--) {
        const currentDate = new Date(uniqueDates[i + 1]);
        const prevDate = new Date(uniqueDates[i]);
        const diffTime = Math.abs(currentDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }

    return {
      totalTrivias,
      totalScore,
      averageScore,
      bestScore,
      totalTime,
      streak,
    };
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getScoreColor = (score, maxScore = 100) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-amber-600 bg-amber-100";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-pink-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center py-12">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center">
              <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cargando perfil
              </h3>
              <p className="text-gray-600">Obteniendo tus estadísticas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 mb-10">
          <div className="flex items-center space-x-8">
            <div className="w-32 h-32 bg-gradient-to-br bg-gray-300 rounded-2xl flex items-center justify-center">
              <User className="w-16 h-16 text-white" />
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {user?.name || "Usuario"}
              </h1>
              <div className="flex items-center space-x-3 text-lg text-gray-600 mb-4">
                <div className="p-1 bg-amber-100 rounded">
                  <Mail className="w-4 h-4 text-black" />
                </div>
                <span>{user?.email}</span>
              </div>

              {/* Role Badge */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user?.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : user?.role === "facilitator"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user?.role === "admin" ? (
                    <>
                      <Shield className="w-4 h-4 mr-1" /> Administrador
                    </>
                  ) : user?.role === "facilitator" ? (
                    <>
                      <GraduationCap className="w-4 h-4 mr-1" /> Facilitador
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-1" /> Estudiante
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-amber-100 rounded">
                    <Calendar className="w-4 h-4 text-black" />
                  </div>
                  <span>
                    Miembro desde {formatDate(user?.createdAt || new Date())}
                  </span>
                </div>
                {userStats?.streak > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="p-1 bg-amber-100 rounded">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                    </div>
                    <span className="font-medium text-amber-700">
                      {userStats.streak} días consecutivos
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-400 rounded-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Trivias Completadas
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats?.totalTrivias || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-400 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Puntuación Total
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats?.totalScore || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-400 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Mejor Puntuación
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats?.bestScore || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-400 rounded-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Tiempo Total
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(userStats?.totalTime || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados Recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Resultados Recientes
            </h3>
          </div>

          {recentResults.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay resultados aún
              </h3>
              <p className="text-gray-600 mb-4">
                Completa tu primera trivia para ver tus resultados aquí
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-amber-400 transition-colors"
              >
                Comenzar una Trivia
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentResults.slice(0, 10).map((result, index) => (
                <div
                  key={result._id || index}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {result.trivia?.title || "Trivia"}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatDate(result.createdAt)}</span>
                        <span>•</span>
                        <span>
                          {result.correctAnswers || 0} de{" "}
                          {result.totalQuestions || 0} correctas
                        </span>
                        {result.timeSpent && (
                          <>
                            <span>•</span>
                            <span>{formatTime(result.timeSpent)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                          result.score
                        )}`}
                      >
                        {result.score} pts
                      </span>
                      <div className="text-sm text-gray-500">
                        {Math.round(
                          ((result.correctAnswers || 0) /
                            (result.totalQuestions || 1)) *
                            100
                        )}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Chart Placeholder */}
        {userStats?.totalTrivias > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Progreso
            </h3>
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>Gráfico de progreso próximamente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
