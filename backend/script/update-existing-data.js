import mongoose from "mongoose";
import Trivia from "../models/Trivia.js";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const updateExistingData = async () => {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado a MongoDB");

    // 1. Actualizar trivias existentes para que sean públicas si fueron creadas por admin
    const adminUsers = await User.find({ role: "admin" });
    const adminIds = adminUsers.map((admin) => admin._id);

    // Actualizar trivias creadas por admins para que sean públicas
    await Trivia.updateMany(
      { createdBy: { $in: adminIds } },
      {
        $set: {
          isPublic: true,
          allowDownloadResults: true,
        },
      }
    );

    // Actualizar trivias no creadas por admins para que sean privadas
    await Trivia.updateMany(
      { createdBy: { $nin: adminIds } },
      {
        $set: {
          isPublic: false,
          allowDownloadResults: true,
        },
      }
    );

    console.log("✅ Trivias existentes actualizadas con nuevos campos");

    // 2. Mostrar estadísticas
    const totalTrivias = await Trivia.countDocuments();
    const publicTrivias = await Trivia.countDocuments({ isPublic: true });
    const privateTrivias = await Trivia.countDocuments({ isPublic: false });

    console.log(`📊 Estadísticas:`);
    console.log(`   Total de trivias: ${totalTrivias}`);
    console.log(`   Trivias públicas: ${publicTrivias}`);
    console.log(`   Trivias privadas: ${privateTrivias}`);

    // 3. Mostrar información de usuarios por rol
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    console.log(`👥 Usuarios por rol:`);
    usersByRole.forEach((role) => {
      console.log(`   ${role._id}: ${role.count}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error al actualizar datos:", error);
    process.exit(1);
  }
};

updateExistingData();
