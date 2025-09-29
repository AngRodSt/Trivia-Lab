import { Router } from "express";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/mailer.js";

const router = Router();

// Función para generar token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

// Registro con verificación
router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const hashedPassword = await hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = new User({ username, email, password: hashedPassword, role, verificationCode: code });
    await newUser.save();
    await sendVerificationEmail(email, code);
    res.json({ message: "Usuario registrado. Revisa tu correo para verificar la cuenta." });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Verificar código
router.post("/verify", async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email, verificationCode: code });
    if (!user) return res.status(400).json({ error: "Código inválido" });
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();
    res.json({ message: "Cuenta verificada con éxito" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Usuario no encontrado" });
    if (!user.isVerified) return res.status(400).json({ error: "Cuenta no verificada" });
    const isMatch = await compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Contraseña incorrecta" });
    
    const token = generateToken(user._id);
    res.json({ 
      message: "Login exitoso", 
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
