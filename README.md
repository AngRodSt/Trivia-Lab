# Trivia Lab 🧠

Una aplicación web de trivia/quiz interactiva que permite a maestros crear cuestionarios y a estudiantes participar en ellos con verificación por email y sistema de roles.

## ✨ Características

- 🔐 **Autenticación completa** con verificación por email
- 👥 **Sistema de roles** (Maestro/Estudiante)
- 📝 **Gestión de trivias** para maestros
- 🎯 **Participación en tiempo real** para estudiantes
- 📊 **Sistema de resultados y estadísticas**
- 🔑 **Códigos únicos** para acceder a trivias
- 📱 **Interfaz responsive** (HTML/CSS/JS vanilla)

## 🛠️ Tecnologías

### Backend
- **Node.js** con Express.js
- **MongoDB Atlas** (Base de datos en la nube)
- **Mongoose** (ODM)
- **JWT** (Autenticación)
- **Nodemailer** (Emails de verificación)
- **bcryptjs** (Encriptación de contraseñas)

### Frontend
- **HTML5, CSS3, JavaScript vanilla**
- **Fetch API** para comunicación con backend

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone git@github.com:AngRodSt/Trivia-Lab.git
cd Trivia-Lab
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
# MongoDB Atlas
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/triviaapp?retryWrites=true&w=majority

# Servidor
PORT=5000
NODE_ENV=development

# Email (Gmail)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 4. Configurar MongoDB Atlas

1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crear un cluster gratuito
3. Crear un usuario de base de datos
4. Obtener la cadena de conexión
5. Agregar tu IP a la whitelist

### 5. Configurar Email (Gmail)

1. Habilitar 2FA en tu cuenta de Gmail
2. Generar una "App Password"
3. Usar esa contraseña en `EMAIL_PASS`

## 🏃‍♂️ Ejecución

### Modo Desarrollo
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

### Poblar base de datos con datos de prueba
```bash
npm run seed
```

El servidor se ejecutará en `http://localhost:5000`

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/verify` - Verificar email con código

### Trivias (Maestros)
- `POST /api/trivia/create` - Crear nueva trivia
- `GET /api/trivia/my-trivias` - Obtener trivias del maestro
- `POST /api/trivia/:id/questions` - Agregar pregunta a trivia
- `PATCH /api/trivia/:id/toggle` - Activar/Desactivar trivia

### Participación (Estudiantes)
- `GET /api/trivia/join/:code` - Unirse a trivia por código
- `POST /api/results/submit` - Enviar respuestas

### Resultados
- `GET /api/results/my-results` - Resultados del estudiante
- `GET /api/results/trivia/:triviaId` - Resultados de trivia (maestros)
- `GET /api/results/:resultId/detail` - Detalle de resultado

## 🔐 Autenticación

La API usa **JWT (JSON Web Tokens)** para autenticación. Incluir el token en el header:

```javascript
Authorization: Bearer <token>
```

## 📁 Estructura del Proyecto

```
trivia-app-clean/
├── backend/
│   ├── middleware/     # Middlewares (auth, etc.)
│   ├── models/         # Modelos de Mongoose
│   ├── routes/         # Rutas de la API
│   ├── script/         # Scripts utilitarios
│   ├── utils/          # Utilidades (mailer, etc.)
│   └── server.js       # Archivo principal
├── frontend/           # Cliente web
├── .env.example        # Variables de entorno template
├── .gitignore         # Archivos ignorados por Git
├── package.json       # Dependencias del proyecto
└── README.md         # Este archivo
```

## 🎯 Flujo de Uso

### Para Maestros:
1. Registrarse y verificar email
2. Iniciar sesión
3. Crear trivias con preguntas
4. Compartir código de trivia con estudiantes
5. Ver resultados y estadísticas

### Para Estudiantes:
1. Registrarse y verificar email
2. Iniciar sesión
3. Unirse a trivia con código
4. Responder preguntas
5. Ver resultados obtenidos

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Ángel Rodríguez** - [AngRodSt](https://github.com/AngRodSt)

## 🙏 Reconocimientos

- MongoDB Atlas por la base de datos gratuita
- Nodemailer por el servicio de emails
- Express.js por el framework web