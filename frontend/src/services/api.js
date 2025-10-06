import axios from "axios";

// Configuración base de la API
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  },
};

// Servicios de trivia
export const triviaAPI = {
  // Obtener todas las trivias disponibles
  getTrivias: async () => {
    const response = await api.get("/trivia");
    return response.data;
  },

  // Obtener una trivia específica
  getTriviaById: async (id) => {
    const response = await api.get(`/trivia/${id}`);
    return response.data;
  },

  // Crear una nueva trivia
  createTrivia: async (triviaData) => {
    const response = await api.post("/trivia", triviaData);
    return response.data;
  },

  // Actualizar trivia
  updateTrivia: async (id, triviaData) => {
    const response = await api.put(`/trivia/${id}`, triviaData);
    return response.data;
  },

  // Eliminar trivia
  deleteTrivia: async (id) => {
    const response = await api.delete(`/trivia/${id}`);
    return response.data;
  },

  // Iniciar una sesión de trivia
  startTrivia: async (triviaId) => {
    const response = await api.post(`/trivia/${triviaId}/start`);
    return response.data;
  },

  // Enviar respuesta
  submitAnswer: async (triviaId, questionId, answer) => {
    const response = await api.post(`/trivia/${triviaId}/answer`, {
      questionId,
      answer,
    });
    return response.data;
  },

  // Completar trivia
  completeTrivia: async (triviaId) => {
    const response = await api.post(`/trivia/${triviaId}/complete`);
    return response.data;
  },
};

// Servicios de resultados
export const resultsAPI = {
  // Obtener leaderboard global
  getLeaderboard: async (limit = 10) => {
    const response = await api.get(`/results/leaderboard?limit=${limit}`);
    return response.data;
  },

  // Obtener leaderboard de una trivia específica
  getTriviaLeaderboard: async (triviaId, limit = 10) => {
    const response = await api.get(
      `/results/leaderboard/${triviaId}?limit=${limit}`
    );
    return response.data;
  },

  // Obtener estadísticas del usuario autenticado
  getMyStats: async () => {
    const response = await api.get("/results/my-stats");
    return response.data;
  },

  // Obtener estadísticas de un usuario específico
  getUserStats: async (userId) => {
    const response = await api.get(`/results/user-stats/${userId}`);
    return response.data;
  },

  // Obtener resultados del usuario (para el perfil)
  getUserResults: async (userId) => {
    const response = await api.get(`/results/my-results`);
    return response.data;
  },
};

export default api;
