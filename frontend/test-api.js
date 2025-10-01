// Script de prueba para verificar la conexión con la API
import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

const testAPI = async () => {
  try {
    console.log("🧪 Probando conexión con la API...");

    // Test 1: Registrar un usuario de prueba
    console.log("📝 Test 1: Registro de usuario");
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      name: "Usuario Test",
      email: "test@ejemplo.com",
      password: "123456",
    });

    console.log("✅ Registro exitoso:", registerResponse.data);

    // Test 2: Login con el usuario registrado
    console.log("🔐 Test 2: Login de usuario");
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "test@ejemplo.com",
      password: "123456",
    });

    console.log("✅ Login exitoso:", loginResponse.data);

    // Test 3: Obtener perfil con token
    console.log("👤 Test 3: Obtener perfil");
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${loginResponse.data.token}`,
      },
    });

    console.log("✅ Perfil obtenido:", profileResponse.data);

    console.log("🎉 ¡Todos los tests pasaron exitosamente!");
  } catch (error) {
    console.error(
      "❌ Error en las pruebas:",
      error.response?.data || error.message
    );
  }
};

// Ejecutar las pruebas
testAPI();
