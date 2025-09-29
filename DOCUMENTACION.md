# Documentación del Proyecto Trivia App

## Descripción General

Esta es una aplicación web de trivia/quiz que permite a maestros crear trivias y a estudiantes participar en ellas. El sistema incluye autenticación con verificación por email, roles de usuario (maestro/estudiante) y gestión de resultados.

## Arquitectura del Proyecto

### **Estructura de Carpetas**

```
trivia-app-clean/
├── backend/           # Servidor Node.js/Express
├── frontend/          # Cliente HTML/CSS/JS vanilla
├── docker-compose.yml # Configuración de contenedores
└── package.json      # Dependencias del proyecto
```

---

## Análisis de Archivos

### **Archivos Raíz**

#### `package.json`

- **Propósito**: Define las dependencias y configuración del proyecto Node.js
- **Dependencias principales**:
  - `express`: Framework web para Node.js
  - `mongoose`: ODM para MongoDB
  - `bcryptjs`: Encriptación de contraseñas
  - `nodemailer`: Envío de emails de verificación
  - `cors`: Manejo de CORS para comunicación frontend-backend
  - `dotenv`: Manejo de variables de entorno
- **Script principal**: `node backend/server.js`

#### `docker-compose.yml`

- **Propósito**: Configuración para levantar MongoDB y Mongo Express en contenedores Docker
- **Servicios**:
  - `mongo`: Base de datos MongoDB en puerto 27017
  - `mongo-express`: Interfaz web para administrar MongoDB en puerto 8081
- **Credenciales MongoDB**:
  - Usuario root: `root`
  - Contraseña: `secret`

---

### **Backend (Servidor)**

#### `backend/server.js`

- **Propósito**: Archivo principal del servidor Express
- **Funcionalidades**:
  - Configura middlewares (CORS, JSON parser)
  - Establece conexión a MongoDB
  - Define rutas de la API
  - Inicia el servidor en puerto 5000 (por defecto)
- **Conexión MongoDB**:
  - Utiliza variable de entorno `MONGO_URI` o fallback a `mongodb://localhost:27017/triviaapp`

#### `backend/db/db.js`

- **Propósito**: Configuración alternativa de conexión a MongoDB
- **Estado**: **ARCHIVO NO UTILIZADO** - Parece ser código legacy
- **Configuración**: Conecta a `mongodb://root:secret@localhost:27017/mi_base_datos`

---

### **Modelos de Datos (MongoDB/Mongoose)**

#### `backend/models/User.js`

- **Propósito**: Modelo de usuario del sistema
- **Campos**:
  - `username`: Nombre único del usuario (mín. 3 caracteres)
  - `email`: Email único en minúsculas
  - `password`: Contraseña hasheada (mín. 6 caracteres)
  - `role`: "maestro" o "estudiante" (por defecto: estudiante)
  - `isVerified`: Estado de verificación de email
  - `verificationCode`: Código temporal de verificación
- **Funcionalidades**:
  - Hash automático de contraseñas antes de guardar
  - Método para comparar contraseñas
  - Timestamps automáticos

#### `backend/models/Trivia.js`

- **Propósito**: Modelo para las trivias/quizzes
- **Campos**:
  - `title`: Título de la trivia
  - `description`: Descripción opcional
  - `code`: Código único para acceder a la trivia
  - `createdBy`: Referencia al usuario maestro que la creó
  - `questions`: Array de referencias a preguntas
  - `isActive`: Estado activo/inactivo

#### `backend/models/Questions.js`

- **Propósito**: Modelo para las preguntas de las trivias
- **Campos**:
  - `text`: Texto de la pregunta
  - `options`: Array de opciones de respuesta
  - `correctAnswer`: Índice numérico de la respuesta correcta
  - `category`: Categoría de la pregunta (indexada)
  - `difficulty`: Dificultad ("easy", "medium", "hard")
  - `trivia`: Referencia a la trivia a la que pertenece
- **Optimizaciones**: Índices en categoría, dificultad y combinados

#### `backend/models/Result.js`

- **Propósito**: Modelo para almacenar resultados de trivias completadas
- **Campos**:
  - `user`: Referencia al estudiante
  - `trivia`: Referencia a la trivia realizada
  - `score`: Puntaje obtenido
  - `answers`: Array con respuestas detalladas:
    - `question`: Referencia a la pregunta
    - `selectedAnswer`: Índice de respuesta seleccionada
    - `isCorrect`: Si fue correcta o no

---

### **Rutas de la API**

#### `backend/routes/auth.js`

- **Propósito**: Manejo de autenticación y registro
- **Endpoints**:
  - `POST /api/auth/register`: Registro con verificación por email
  - `POST /api/auth/verify`: Verificación de código de email
  - `POST /api/auth/login`: Inicio de sesión
- **Funcionalidades**:
  - Generación de códigos de verificación aleatorios (6 dígitos)
  - Envío de emails de verificación
  - Validación de credenciales

#### `backend/routes/trivia.js` **IMPLEMENTADO**

- **Estado**: Archivo referenciado en `server.js` pero no existe
- **Propósito esperado**: Gestión de trivias (crear, listar, obtener por código)

#### `backend/routes/results.js` **IMPLEMENTADO**

- **Estado**: Archivo referenciado en `server.js` pero no existe
- **Propósito esperado**: Gestión de resultados (guardar, consultar)

---

### **Utilidades**

#### `backend/utils/mailer.js`

- **Propósito**: Configuración y envío de emails
- **Servicio**: Gmail SMTP
- **Configuración**: Usa variables de entorno `EMAIL_USER` y `EMAIL_PASS`
- **Función**: `sendVerificationEmail()` para códigos de verificación

---

### **Scripts de Utilidad**

#### `backend/script/seed.js`

- **Propósito**: Script para poblar la base de datos con datos de prueba
- **Funcionalidad**:
  - Limpia la colección de usuarios
  - Crea 3 usuarios de ejemplo (1 maestro, 2 estudiantes)
  - Las contraseñas se hashean automáticamente
- **Conexión**: Usa la misma configuración que `db.js`

#### `backend/script/test.js` **ARCHIVO NO ENCONTRADO**

- **Estado**: Referenciado pero no existe en el proyecto

---

### **Frontend (Cliente)**

#### `frontend/index.html`

- **Propósito**: Página principal/landing
- **Contenido**: Página simple con enlaces a registro, login y verificación
- **Estado**: **MUY BÁSICO** - Solo contiene enlaces

#### `frontend/register.html`

- **Propósito**: Formulario de registro de usuarios
- **Campos**: Username, email, password, rol (estudiante/maestro)
- **Estado**: **SIN ESTILOS** - HTML mínimo sin CSS

#### `frontend/login.html`

- **Propósito**: Formulario de inicio de sesión
- **Campos**: Email y contraseña
- **Estado**: **SIN ESTILOS** - HTML mínimo

#### `frontend/verify.html`

- **Propósito**: Formulario para verificar email con código
- **Campos**: Email y código de verificación
- **Estado**: **SIN ESTILOS** - HTML mínimo

#### `frontend/app.js`

- **Propósito**: Lógica JavaScript del frontend
- **Funcionalidades**:
  - Manejo de formularios (registro, login, verificación)
  - Comunicación con API backend (`http://localhost:5000/api`)
  - Alertas básicas para mostrar respuestas
- **Estado**: **CÓDIGO MINIFICADO** - Difícil de mantener

---

## Configuración de Base de Datos

### **Tipo de Conexión: NUBE (MongoDB Atlas)**

La aplicación está configurada para usar MongoDB **Atlas** (nube):

1. **Configuración Principal** (`server.js`):
   - Variable de entorno: `MONGO_URI` requerida
   - Formato: `mongodb+srv://usuario:password@cluster.mongodb.net/triviaapp`

2. **Docker - NO NECESARIO**:
   - Al usar MongoDB Atlas, no se requiere Docker para la base de datos
   - El archivo `docker-compose.yml` puede eliminarse o mantenerse para desarrollo local opcional

3. **Variables de Entorno**:
   - Crear archivo `.env` basado en `.env.example`
   - Configurar `MONGO_URI` con credenciales de Atlas
   - Configurar credenciales de email para verificación

### **Ventajas de MongoDB Atlas**:
- Sin necesidad de gestionar infraestructura de DB
- Backups automáticos
- Escalabilidad automática
- Monitoreo incluido
- Acceso desde cualquier lugar

---

## Issues Resueltos

### **Archivos Completados**:

1. `backend/routes/trivia.js` - Rutas para gestión de trivias (CREADO)
2. `backend/routes/results.js` - Rutas para resultados (CREADO) 
3. `backend/middleware/auth.js` - Middleware de autenticación JWT (CREADO)
4. Sintaxis estandarizada a ES6 modules (ACTUALIZADO)
5. Configuración para MongoDB Atlas (ACTUALIZADO)

### **Problemas Pendientes**:

#### **Frontend Incompleto**:
1. Sin estilos CSS
2. Sin páginas para usar trivias
3. Código JavaScript necesita mejoras
4. Falta navegación entre páginas

#### **Mejoras Necesarias**:
1. Validaciones de entrada más robustas
2. Manejo de errores mejorado
3. Tests unitarios y de integración
4. Documentación de API completa

---

## Próximos Pasos Sugeridos

1. **Mejorar frontend** (CSS, páginas de trivia)
2. **Agregar validaciones** y manejo de errores
3. **Crear documentación de API** (endpoints)
4. **Tests unitarios** y de integración
5. **Implementar paginación** en listados
6. **Agregar filtros** de búsqueda
7. **Optimizar rendimiento** de consultas

---

## Tecnologías Utilizadas

- **Backend**: Node.js, Express.js, Mongoose
- **Base de Datos**: MongoDB Atlas (cloud)
- **Autenticación**: JWT + bcryptjs
- **Email**: Nodemailer (Gmail)
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Desarrollo**: Nodemon, dotenv
