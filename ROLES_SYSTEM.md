# Sistema de Roles - Trivia App

## Descripción del Sistema de Roles

La aplicación ahora cuenta con un sistema de roles que permite diferentes niveles de acceso y funcionalidades según el tipo de usuario.

## Tipos de Usuario

### 🎓 **Estudiante (user)**

- **Acceso**: Trivias públicas y trivias privadas mediante código
- **Funcionalidades**:
  - Jugar trivias públicas disponibles en la página principal
  - Unirse a trivias privadas usando el código proporcionado por facilitadores
  - Ver su perfil y estadísticas personales
  - Ver el leaderboard global
- **Registro**: Pueden registrarse seleccionando "Estudiante" en el formulario

### 👨‍🏫 **Facilitador (facilitator)**

- **Acceso**: Todas las funcionalidades de estudiante + creación de trivias privadas
- **Funcionalidades**:
  - Crear trivias privadas para sus estudiantes
  - Generar códigos únicos para compartir con estudiantes
  - Dashboard para gestionar sus trivias
  - Ver resultados detallados de sus trivias
  - Descargar reportes en formato CSV
  - Activar/desactivar trivias
- **Registro**: Pueden registrarse seleccionando "Facilitador" en el formulario
- **Características especiales**:
  - Las trivias creadas por facilitadores son **privadas por defecto**
  - Solo pueden ser accedidas mediante código
  - Tienen acceso completo a los resultados y estadísticas de sus trivias

### 🔧 **Administrador (admin)**

- **Acceso**: Todas las funcionalidades + gestión de trivias públicas
- **Funcionalidades**:
  - Todas las funcionalidades de facilitador
  - Crear trivias públicas que aparecen en la lista general
  - Gestión completa del sistema
- **Registro**: Solo mediante creación manual en la base de datos
- **Características especiales**:
  - Las trivias creadas por admins son **públicas por defecto**
  - Aparecen en la lista principal para todos los usuarios

## Flujo de Trabajo

### Para Estudiantes

1. Registrarse como "Estudiante"
2. Ver trivias públicas en la página principal
3. Unirse a trivias privadas usando códigos de facilitadores
4. Completar trivias y ver sus estadísticas

### Para Facilitadores

1. Registrarse como "Facilitador"
2. Acceder al Dashboard desde la navegación
3. Crear nuevas trivias con preguntas personalizadas
4. Compartir el código generado con estudiantes
5. Monitorear resultados y descargar reportes
6. Gestionar el estado (activo/inactivo) de sus trivias

### Para Administradores

1. Crear trivias públicas que todos pueden ver
2. Gestionar el sistema completo
3. Las mismas funcionalidades que facilitadores pero con alcance público

## Funcionalidades del Dashboard

### Crear Trivia

- Formulario intuitivo para agregar título, descripción y dificultad
- Agregar múltiples preguntas con opciones de respuesta
- Generación automática de código único de 6 dígitos
- Previsualización de preguntas antes de guardar

### Gestión de Trivias

- Lista de todas las trivias creadas
- Estadísticas rápidas (total, activas, públicas/privadas)
- Acciones rápidas: ver resultados, descargar, activar/desactivar
- Copia rápida del código para compartir

### Resultados y Análisis

- Vista detallada de participantes y sus resultados
- Estadísticas de resumen: total participantes, completados, promedio
- Tabla con información completa de cada estudiante
- Descarga de resultados en formato CSV con:
  - Nombre y email del estudiante
  - Puntaje obtenido y porcentaje
  - Tiempo de inicio y finalización
  - Tiempo transcurrido
  - Estado de completitud

## Estructura de Datos

### Usuario (User)

```javascript
{
  name: String,
  email: String,
  password: String,
  role: ["admin", "facilitator", "user"], // Nuevo campo
  isVerified: Boolean,
  // ... otros campos
}
```

### Trivia

```javascript
{
  title: String,
  description: String,
  code: String, // Código único de 6 dígitos
  difficulty: ["easy", "medium", "hard"],
  createdBy: ObjectId, // Referencia al usuario
  questions: [ObjectId], // Referencias a preguntas
  isActive: Boolean,
  isPublic: Boolean, // Nuevo: true para admins, false para facilitators
  allowDownloadResults: Boolean, // Nuevo: permite descargar resultados
  // ... otros campos
}
```

## Nuevas Rutas API

### Autenticación

- `POST /api/auth/register` - Ahora acepta el campo `role`

### Trivias

- `GET /api/trivia/my-trivias` - Obtener trivias del usuario autenticado
- `GET /api/trivia/:id/results` - Obtener resultados de una trivia (solo creador)
- `GET /api/trivia/:id/results/download` - Descargar resultados en CSV
- `GET /api/trivia/join/:code` - Unirse a trivia por código
- `POST /api/trivia/create` - Crear trivia (admins y facilitators)

## Componentes Frontend

### Nuevos Componentes

- `Dashboard.jsx` - Panel de control para facilitadores y admins
- `JoinTriviaByCode.jsx` - Componente para unirse por código

### Componentes Actualizados

- `Register.jsx` - Selector de tipo de usuario
- `Layout.jsx` - Navegación condicional según rol
- `Home.jsx` - Componente de unirse por código para estudiantes
- `Profile.jsx` - Muestra el rol del usuario

## Permisos y Seguridad

### Validaciones Backend

- Solo admins y facilitators pueden crear trivias
- Solo el creador puede ver/descargar resultados de sus trivias
- Validación de roles en todas las rutas protegidas
- Los códigos de trivia son únicos y de 6 dígitos

### Validaciones Frontend

- Navegación condicional según rol
- Componentes protegidos según permisos
- Dashboard solo visible para roles autorizados

## Migración de Datos Existentes

Usar el script `backend/script/update-existing-data.js` para:

- Actualizar trivias existentes con nuevos campos
- Asignar `isPublic: true` a trivias creadas por admins
- Asignar `isPublic: false` a trivias creadas por otros usuarios
- Configurar `allowDownloadResults: true` por defecto

## Próximas Mejoras

1. **Notificaciones**: Sistema de notificaciones para nuevas trivias
2. **Grupos**: Organizar estudiantes en grupos/clases
3. **Plantillas**: Plantillas predefinidas para facilitadores
4. **Analíticas**: Más métricas y gráficos de rendimiento
5. **Exportación**: Más formatos de exportación (PDF, Excel)
6. **Colaboración**: Permitir co-facilitadores en trivias
