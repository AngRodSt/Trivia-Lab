import React, { useState, useEffect } from "react";
import { Trophy, Medal, Award, Star, Filter, Calendar } from "lucide-react";
import { resultsAPI } from "../services/api";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedPeriod]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await resultsAPI.getLeaderboard();
      setLeaderboard(data);
      setError(null);
    } catch (error) {
      setError("Error al cargar el ranking");
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
            {position}
          </div>
        );
    }
  };

  const getRankStyle = (position) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center py-12">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center">
              <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cargando ranking
              </h3>
              <p className="text-gray-600">
                Obteniendo las mejores puntuaciones...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br bg-amber-400 rounded-2xl flex items-center justify-center mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Ranking Global
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Los mejores jugadores de TriviaLab compitiendo por la gloria
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Filter className="w-5 h-5 text-amber-600" />
              </div>
              <span className="font-semibold text-gray-900 text-lg">
                Filtrar ranking:
              </span>
            </div>

            <div className="flex space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white font-medium"
              >
                <option value="all">Todo el tiempo</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="year">Este año</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {/* Second Place */}
              <div className="text-center order-1">
                <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Medal className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {leaderboard[1]?.user?.name || "Usuario"}
                  </h3>
                  <p className="text-2xl font-bold text-gray-600 mb-1">
                    {leaderboard[1]?.totalScore || 0}
                  </p>
                  <p className="text-sm text-gray-500">puntos</p>
                  <div className="mt-3 text-xs text-gray-400">
                    {leaderboard[1]?.triviasCompleted || 0} trivias completadas
                  </div>
                </div>
              </div>

              {/* First Place */}
              <div className="text-center order-2 -mt-4">
                <div className="bg-white rounded-xl shadow-md border-2 border-yellow-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-yellow-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 text-lg">
                    {leaderboard[0]?.user?.name || "Usuario"}
                  </h3>
                  <p className="text-3xl font-bold text-yellow-600 mb-1">
                    {leaderboard[0]?.totalScore || 0}
                  </p>
                  <p className="text-sm text-yellow-600 font-medium">puntos</p>
                  <div className="mt-3 text-xs text-gray-500">
                    {leaderboard[0]?.triviasCompleted || 0} trivias completadas
                  </div>
                </div>
              </div>

              {/* Third Place */}
              <div className="text-center order-3">
                <div className="bg-white rounded-xl shadow-sm border-2 border-amber-200 p-6 hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Award className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {leaderboard[2]?.user?.name || "Usuario"}
                  </h3>
                  <p className="text-2xl font-bold text-amber-600 mb-1">
                    {leaderboard[2]?.totalScore || 0}
                  </p>
                  <p className="text-sm text-amber-600">puntos</p>
                  <div className="mt-3 text-xs text-gray-400">
                    {leaderboard[2]?.triviasCompleted || 0} trivias completadas
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              Ranking Completo
            </h3>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <Trophy className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Aún no hay datos
              </h3>
              <p className="text-gray-600 text-lg">
                Sé el primero en completar una trivia y aparecer en el ranking
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry._id || index}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${getRankStyle(
                    index + 1
                  )}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getRankIcon(index + 1)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-amber-700">
                              {(entry.user?.name || "Usuario")[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {entry.user?.name || "Usuario Anónimo"}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>
                                {entry.triviasCompleted || 0} trivias
                                completadas
                              </span>
                              <span>•</span>
                              <span>Promedio: {entry.averageScore || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {entry.totalScore || 0}
                      </div>
                      <div className="text-sm text-gray-500">puntos</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Card */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center hover:shadow-2xl transition-shadow">
            <div className="w-12 h-12 mx-auto bg-black rounded-xl flex items-center justify-center mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-black mb-2">
              {leaderboard.length}
            </div>
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Jugadores Registrados
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center hover:shadow-2xl transition-shadow">
            <div className="w-12 h-12 mx-auto bg-amber-400 rounded-xl flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-black mb-2">
              {leaderboard.reduce(
                (sum, entry) => sum + (entry.triviasCompleted || 0),
                0
              )}
            </div>
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Trivias Completadas
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center hover:shadow-2xl transition-shadow">
            <div className="w-12 h-12 mx-auto bg-black rounded-xl flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold text-black mb-2">
              {leaderboard.length > 0
                ? Math.round(
                    leaderboard.reduce(
                      (sum, entry) => sum + (entry.averageScore || 0),
                      0
                    ) / leaderboard.length
                  )
                : 0}
              %
            </div>
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Promedio Global
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
