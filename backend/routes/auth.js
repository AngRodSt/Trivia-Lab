import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Función para generar token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Registro
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validar datos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Todos los campos son requeridos",
      });
    }

    // Validar longitud de password
    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: "Ya existe un usuario con este correo electrónico",
      });
    }

    // Crear nuevo usuario
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      isVerified: true, // Por simplicidad, activamos directamente
    });

    await newUser.save();

    // Generar token
    const token = generateToken(newUser._id);

    // Actualizar último login
    newUser.lastLogin = new Date();
    await newUser.save();

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

// Obtener perfil del usuario autenticado
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

// Actualizar perfil
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        message: "El nombre debe tener al menos 2 caracteres",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    user.name = name.trim();
    await user.save();

    res.json({
      message: "Perfil actualizado exitosamente",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

// Cambiar contraseña
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Contraseña actual y nueva son requeridas",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "La nueva contraseña debe tener al menos 6 caracteres",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Verificar contraseña actual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        message: "Contraseña actual incorrecta",
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos requeridos
    if (!email || !password) {
      return res.status(400).json({
        message: "Email y contraseña son requeridos",
      });
    }

    // Buscar usuario
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        message: "Credenciales inválidas",
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(400).json({
        message: "Cuenta desactivada. Contacta al administrador",
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Credenciales inválidas",
      });
    }

    // Generar token
    const token = generateToken(user._id);

    // Actualizar último login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: "Login exitoso",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
});

export default router;
