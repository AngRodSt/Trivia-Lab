import express from "express";
import triviaRoutes from "./routes/trivia.js";

const app = express();
app.use(express.json());

// Agregar las rutas de trivia
app.use("/api/trivia", triviaRoutes);

// Middleware para capturar todas las rutas y mostrar cuál se está ejecutando
app.use("/api/trivia/*", (req, res, next) => {
  console.log(`Ruta capturada: ${req.method} ${req.originalUrl}`);
  console.log(`Parámetros: `, req.params);
  next();
});

app.listen(3002, () => {
  console.log("Servidor de prueba corriendo en puerto 3002");
  console.log("Rutas registradas:");

  // Listar todas las rutas registradas
  app._router.stack.forEach((middleware, index) => {
    if (middleware.route) {
      console.log(
        `${index}: ${Object.keys(middleware.route.methods)} ${
          middleware.route.path
        }`
      );
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((handler, subIndex) => {
        if (handler.route) {
          console.log(
            `${index}.${subIndex}: ${Object.keys(handler.route.methods)} ${
              handler.route.path
            }`
          );
        }
      });
    }
  });
});
