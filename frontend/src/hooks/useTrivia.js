import { useContext } from "react";
import TriviaContext from "../context/TriviaContext";

export const useTrivia = () => {
  const context = useContext(TriviaContext);
  if (!context) {
    throw new Error("useTrivia must be used within a TriviaProvider");
  }
  return context;
};
