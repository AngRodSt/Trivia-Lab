import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { triviaAPI } from "../services/api";

// Estados iniciales
const initialState = {
  trivias: [],
  currentTrivia: null,
  currentQuestion: 0,
  answers: [],
  score: 0,
  timeRemaining: null,
  isPlaying: false,
  isCompleted: false,
  loading: false,
  error: null,
};

// Tipos de acciones
const TRIVIA_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_TRIVIAS: "SET_TRIVIAS",
  SET_CURRENT_TRIVIA: "SET_CURRENT_TRIVIA",
  START_TRIVIA: "START_TRIVIA",
  NEXT_QUESTION: "NEXT_QUESTION",
  PREVIOUS_QUESTION: "PREVIOUS_QUESTION",
  SUBMIT_ANSWER: "SUBMIT_ANSWER",
  SET_TIME_REMAINING: "SET_TIME_REMAINING",
  COMPLETE_TRIVIA: "COMPLETE_TRIVIA",
  RESET_TRIVIA: "RESET_TRIVIA",
};

// Reducer
const triviaReducer = (state, action) => {
  switch (action.type) {
    case TRIVIA_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case TRIVIA_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case TRIVIA_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case TRIVIA_ACTIONS.SET_TRIVIAS:
      return {
        ...state,
        trivias: action.payload,
        loading: false,
        error: null,
      };

    case TRIVIA_ACTIONS.SET_CURRENT_TRIVIA:
      return {
        ...state,
        currentTrivia: action.payload,
        loading: false,
        error: null,
      };

    case TRIVIA_ACTIONS.START_TRIVIA:
      return {
        ...state,
        isPlaying: true,
        isCompleted: false,
        currentQuestion: 0,
        answers: [],
        score: 0,
        timeRemaining: action.payload.timeLimit || null,
      };

    case TRIVIA_ACTIONS.NEXT_QUESTION:
      return {
        ...state,
        currentQuestion: Math.min(
          state.currentQuestion + 1,
          (state.currentTrivia?.questions?.length || 1) - 1
        ),
      };

    case TRIVIA_ACTIONS.PREVIOUS_QUESTION:
      return {
        ...state,
        currentQuestion: Math.max(state.currentQuestion - 1, 0),
      };

    case TRIVIA_ACTIONS.SUBMIT_ANSWER:
      const newAnswers = [...state.answers];
      const answerIndex = newAnswers.findIndex(
        (answer) => answer.questionId === action.payload.questionId
      );

      if (answerIndex >= 0) {
        newAnswers[answerIndex] = action.payload;
      } else {
        newAnswers.push(action.payload);
      }

      return {
        ...state,
        answers: newAnswers,
        score: action.payload.score || state.score,
      };

    case TRIVIA_ACTIONS.SET_TIME_REMAINING:
      return {
        ...state,
        timeRemaining: action.payload,
      };

    case TRIVIA_ACTIONS.COMPLETE_TRIVIA:
      return {
        ...state,
        isPlaying: false,
        isCompleted: true,
        timeRemaining: null,
      };

    case TRIVIA_ACTIONS.RESET_TRIVIA:
      return {
        ...state,
        currentTrivia: null,
        currentQuestion: 0,
        answers: [],
        score: 0,
        timeRemaining: null,
        isPlaying: false,
        isCompleted: false,
        error: null,
      };

    default:
      return state;
  }
};

// Contexto
const TriviaContext = createContext();

// Provider
export const TriviaProvider = ({ children }) => {
  const [state, dispatch] = useReducer(triviaReducer, initialState);

  // Cargar trivias disponibles
  const loadTrivias = useCallback(async () => {
    try {
      dispatch({ type: TRIVIA_ACTIONS.SET_LOADING, payload: true });
      const trivias = await triviaAPI.getTrivias();
      dispatch({ type: TRIVIA_ACTIONS.SET_TRIVIAS, payload: trivias });
    } catch (error) {
      dispatch({
        type: TRIVIA_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || "Error al cargar las trivias",
      });
    }
  }, []);

  // Cargar trivia específica
  const loadTrivia = useCallback(async (triviaId) => {
    try {
      dispatch({ type: TRIVIA_ACTIONS.SET_LOADING, payload: true });
      const trivia = await triviaAPI.getTriviaById(triviaId);
      dispatch({ type: TRIVIA_ACTIONS.SET_CURRENT_TRIVIA, payload: trivia });
    } catch (error) {
      dispatch({
        type: TRIVIA_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || "Error al cargar la trivia",
      });
    }
  }, []);

  // Iniciar trivia
  const startTrivia = useCallback(async (triviaId) => {
    try {
      const session = await triviaAPI.startTrivia(triviaId);
      dispatch({
        type: TRIVIA_ACTIONS.START_TRIVIA,
        payload: session,
      });
    } catch (error) {
      dispatch({
        type: TRIVIA_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || "Error al iniciar la trivia",
      });
    }
  }, []);

  // Navegar entre preguntas
  const nextQuestion = useCallback(() => {
    dispatch({ type: TRIVIA_ACTIONS.NEXT_QUESTION });
  }, []);

  const previousQuestion = useCallback(() => {
    dispatch({ type: TRIVIA_ACTIONS.PREVIOUS_QUESTION });
  }, []);

  // Enviar respuesta
  const submitAnswer = useCallback(
    async (questionId, answer) => {
      try {
        if (!state.currentTrivia) return;

        const response = await triviaAPI.submitAnswer(
          state.currentTrivia._id,
          questionId,
          answer
        );

        dispatch({
          type: TRIVIA_ACTIONS.SUBMIT_ANSWER,
          payload: {
            questionId,
            answer,
            correct: response.correct,
            correctAnswer: response.correctAnswer,
            score: response.totalScore,
            points: response.points,
          },
        });

        return response;
      } catch (error) {
        dispatch({
          type: TRIVIA_ACTIONS.SET_ERROR,
          payload: error.response?.data?.message || "Error al enviar respuesta",
        });
        throw error;
      }
    },
    [state.currentTrivia]
  );

  // Completar trivia
  const completeTrivia = useCallback(async () => {
    try {
      if (state.currentTrivia) {
        await triviaAPI.completeTrivia(state.currentTrivia._id);
      }
      dispatch({ type: TRIVIA_ACTIONS.COMPLETE_TRIVIA });
    } catch (error) {
      dispatch({
        type: TRIVIA_ACTIONS.SET_ERROR,
        payload:
          error.response?.data?.message || "Error al completar la trivia",
      });
    }
  }, [state.currentTrivia]);

  // Reiniciar trivia
  const resetTrivia = useCallback(() => {
    dispatch({ type: TRIVIA_ACTIONS.RESET_TRIVIA });
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => {
    dispatch({ type: TRIVIA_ACTIONS.CLEAR_ERROR });
  }, []);

  // Timer effect
  useEffect(() => {
    let timer;
    if (state.isPlaying && state.timeRemaining > 0) {
      timer = setInterval(() => {
        dispatch({
          type: TRIVIA_ACTIONS.SET_TIME_REMAINING,
          payload: state.timeRemaining - 1,
        });
      }, 1000);
    } else if (state.isPlaying && state.timeRemaining === 0) {
      completeTrivia();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.isPlaying, state.timeRemaining, completeTrivia]);

  const value = {
    ...state,
    loadTrivias,
    loadTrivia,
    startTrivia,
    nextQuestion,
    previousQuestion,
    submitAnswer,
    completeTrivia,
    resetTrivia,
    clearError,
  };

  return (
    <TriviaContext.Provider value={value}>{children}</TriviaContext.Provider>
  );
};

export default TriviaContext;
