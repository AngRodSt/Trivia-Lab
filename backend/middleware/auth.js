import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "Token de acceso requerido" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password -verificationCode");
    
    if (!user) {
      return res.status(401).json({ error: "Token inválido" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: "Cuenta no verificada" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ 
        error: `Acceso denegado. Se requiere rol de ${role}` 
      });
    }
    next();
  };
};