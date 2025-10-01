import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        message: "Token de acceso requerido",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Token inválido - Usuario no encontrado",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        message: "Cuenta desactivada",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error en autenticación:", error);
    return res.status(403).json({
      message: "Token inválido o expirado",
    });
  }
};

// Mantener la función original por compatibilidad
export const authenticateToken = authMiddleware;

export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({
        error: `Acceso denegado. Se requiere rol de ${role}`,
      });
    }
    next();
  };
};
