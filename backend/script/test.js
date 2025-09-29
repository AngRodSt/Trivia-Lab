const mongoose = require("mongoose");
const User = require("../models/User");

(async () => {
  await mongoose.connect("mongodb://root:secret@localhost:27017/mi_base_datos?authSource=admin");

  const user = await User.findOne({ email: "juan@example.com" });
  console.log("Usuario:", user.username);

  // Probar password correcto
  const ok = await user.comparePassword("123456");
  console.log("Contraseña correcta?", ok);

  // Probar password incorrecto
  const fail = await user.comparePassword("wrongpass");
  console.log("Contraseña incorrecta?", fail);

  process.exit();
})();
