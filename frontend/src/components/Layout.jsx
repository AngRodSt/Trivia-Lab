import React from "react";
import { useAuth } from "../hooks/useAuth";
import { LogOut, User, Home, Trophy, Settings, BarChart3 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) {
    return <div className="min-h-screen bg-gray-50">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-10 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-black">TriviaLab</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => navigate("/")}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "text-black bg-amber-50"
                    : "text-gray-600 hover:text-black hover:bg-amber-50"
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Inicio
              </button>
              <button
                onClick={() => navigate("/leaderboard")}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/leaderboard")
                    ? "text-black bg-amber-50"
                    : "text-gray-600 hover:text-black hover:bg-amber-50"
                }`}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Ranking
              </button>
              {(user?.role === "admin" || user?.role === "facilitator") && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "text-black bg-amber-50"
                      : "text-gray-600 hover:text-black hover:bg-amber-50"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
              )}
              <button
                onClick={() => navigate("/profile")}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/profile")
                    ? "text-black bg-amber-50"
                    : "text-gray-600 hover:text-black hover:bg-amber-50"
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Perfil
              </button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-black" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user.name || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-4">
            <div className="flex space-x-4 flex-wrap">
              <button
                onClick={() => navigate("/")}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "text-black bg-amber-50"
                    : "text-gray-600 hover:text-black hover:bg-amber-50"
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Inicio
              </button>
              <button
                onClick={() => navigate("/leaderboard")}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/leaderboard")
                    ? "text-black bg-amber-50"
                    : "text-gray-600 hover:text-black hover:bg-amber-50"
                }`}
              >
                <Trophy className="w-4 h-4 mr-2" />
                Ranking
              </button>
              {(user?.role === "admin" || user?.role === "facilitator") && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "text-black bg-amber-50"
                      : "text-gray-600 hover:text-black hover:bg-amber-50"
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
              )}
              <button
                onClick={() => navigate("/profile")}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/profile")
                    ? "text-black bg-amber-50"
                    : "text-gray-600 hover:text-black hover:bg-amber-50"
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Perfil
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;
