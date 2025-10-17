# API - Sistema de Control de Evaluaciones de Centros de Manejo

API REST para el sistema de control de evaluaciones de licencias de conducir con base de datos Oracle XE.

**Proyecto Fase 2 - Bases de Datos 1**  
**Carnet:** 201709196

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js (v14 o superior)
- Docker y Docker Compose
- Oracle Database XE (via Docker)

### Instalación

1. **Instalar dependencias**
```bash
npm install
```

2. **Iniciar la base de datos Oracle**
```bash
cd ..
docker-compose up -d
# Esperar hasta ver "DATABASE IS READY TO USE!"
docker-compose logs -f
```

3. **Configurar variables de entorno**
El archivo `.env` ya está configurado con:
```env
PORT=3000
NODE_ENV=development
DB_USER=system
DB_PASSWORD=Gusano15.
DB_CONNECTION_STRING=localhost:1521/XEPDB1
```

4. **Iniciar el servidor**

Modo desarrollo (con auto-reload):
```bash
npm run dev
```

Modo producción:
```bash
npm start
```

5. **Acceder a la API**

- **API REST:** http://localhost:3000/api
- **Health Check:** http://localhost:3000/health
- **Probar con Postman, cURL o cualquier cliente HTTP**

## 📡 Endpoints Disponibles

### General
- `GET /` - Información de la API y lista de endpoints
- `GET /health` - Estado del servidor
- `GET /api/test` - Prueba de conexión a la base de datos

### Centros de Evaluación (CRUD Completo)
- `GET /api/centros` - Obtener todos los centros
- `GET /api/centros/:id` - Obtener centro por ID
- `GET /api/centros/:id_centro/dashboard` - Dashboard de estadísticas del centro
- `POST /api/centros` - Crear un nuevo centro
- `PUT /api/centros/:id` - Actualizar centro existente
- `DELETE /api/centros/:id` - Eliminar centro

### Personas (CRUD Completo)
- `GET /api/personas` - Obtener todas las personas
- `GET /api/personas/buscar/:identificacion` - Buscar persona por DPI/identificación
- `POST /api/personas` - Crear una nueva persona
- `PUT /api/personas/:id` - Actualizar persona existente
- `DELETE /api/personas/:id` - Eliminar persona

### Evaluaciones
- `GET /api/evaluaciones` - Obtener todas las evaluaciones
  - Parámetros query: `id_centro`, `fecha_inicio`, `fecha_fin`, `resultado`
- `GET /api/evaluaciones/:id` - Obtener evaluación por ID (incluye detalles teóricos y prácticos)

### Estadísticas
- `GET /api/estadisticas/diarias` - Estadísticas diarias
  - Parámetros query: `id_centro`, `fecha`

### Catálogos
- `GET /api/tipos-licencia` - Tipos de licencia disponibles (M, P, B, A, E)
- `GET /api/tipos-tramite` - Tipos de trámite (Primera, Cambio, Renovación)

### Departamentos (CRUD Completo)
- `GET /api/departamentos` - Obtener todos los departamentos
- `GET /api/departamentos/:id` - Obtener departamento por ID
- `POST /api/departamentos` - Crear un nuevo departamento
- `PUT /api/departamentos/:id` - Actualizar departamento existente
- `DELETE /api/departamentos/:id` - Eliminar departamento

### Municipios (CRUD Completo)
- `GET /api/municipios` - Obtener todos los municipios
- `GET /api/municipios/:id` - Obtener municipio por ID
- `GET /api/departamentos/:id_departamento/municipios` - Obtener municipios de un departamento
- `POST /api/municipios` - Crear un nuevo municipio
- `PUT /api/municipios/:id` - Actualizar municipio existente
- `DELETE /api/municipios/:id` - Eliminar municipio

### Preguntas
- `GET /api/preguntas/teoricas` - Obtener preguntas teóricas
  - Parámetros query: `id_tipo_licencia`, `estado`
- `GET /api/preguntas/teoricas/:id` - Obtener pregunta con sus respuestas

---

## � Documentación Completa

### Guías de Uso con Postman:
- **[POSTMAN_QUICK_START.md](./POSTMAN_QUICK_START.md)** - ⭐ Guía rápida con ejemplos prácticos y troubleshooting
- **[POSTMAN_CRUD_GUIDE.md](./POSTMAN_CRUD_GUIDE.md)** - Guía completa de todos los endpoints CRUD con ejemplos
- **[CRUD_GUIDE.md](./CRUD_GUIDE.md)** - Documentación detallada de operaciones CRUD
- **[CRUD_IMPLEMENTATION_PLAN.md](./CRUD_IMPLEMENTATION_PLAN.md)** - Plan de implementación de las 17 tablas

### Estado de Implementación:
✅ **CRUD Completo (21 endpoints):**
- Departamentos (5 endpoints)
- Municipios (6 endpoints)
- Centros de Evaluación (5 endpoints)
- Personas (5 endpoints)

🔄 **Pendientes:**
- 13 tablas restantes (~65 endpoints adicionales)

## 🗄️ Estructura de la Base de Datos

La base de datos incluye las siguientes tablas principales:

### Catálogos
- **DEPARTAMENTO** - Departamentos de Guatemala
- **MUNICIPIO** - Municipios por departamento
- **TIPO_LICENCIA** - Tipos de licencia (M, P, B, A, E)
- **TIPO_TRAMITE** - Tipos de trámite

### Entidades Principales
- **CENTRO_EVALUACION** - Centros autorizados para evaluaciones
- **ESCUELA_AUTOMOVILISMO** - Escuelas de manejo registradas
- **PERSONA** - Personas que solicitan evaluación
- **INSTRUCTOR** - Instructores de los centros
- **USUARIO_SISTEMA** - Usuarios del sistema

### Preguntas y Evaluaciones
- **PREGUNTA_TEORICA** - Banco de preguntas teóricas
- **RESPUESTA_TEORICA** - Respuestas múltiples para cada pregunta
- **PREGUNTA_PRACTICA** - Tareas/actividades prácticas
- **EVALUACION** - Registro de evaluaciones realizadas
- **DETALLE_EVALUACION_TEORICA** - Respuestas dadas en teoría
- **DETALLE_EVALUACION_PRACTICA** - Calificaciones de práctica
- **ESTADISTICAS_DIARIAS** - Estadísticas agregadas por centro/día

## 📊 Ejemplos de Uso

### Obtener todos los centros
```bash
curl http://localhost:3000/api/centros
```

### Buscar persona por DPI
```bash
curl http://localhost:3000/api/personas/buscar/1234567890101
```

### Obtener evaluaciones de un centro en un rango de fechas
```bash
curl "http://localhost:3000/api/evaluaciones?id_centro=1&fecha_inicio=2025-01-01&fecha_fin=2025-12-31"
```

### Dashboard de un centro
```bash
curl http://localhost:3000/api/centros/1/dashboard
```

## 🛠️ Tecnologías

- **Express 5.x** - Framework web
- **Oracle Database XE 18c** - Base de datos
- **node-oracledb 6.x** - Driver de Oracle para Node.js
- **dotenv** - Gestión de variables de entorno
- **nodemon** - Auto-reload en desarrollo

## 📁 Estructura del Proyecto

```
API/
├── config/
│   └── database.js          # Configuración de conexión a Oracle
├── controllers/
│   └── evaluacionController.js  # Controladores de la API
├── routes/
│   └── evaluacion.routes.js     # Definición de rutas
├── .env                     # Variables de entorno
├── server.js                # Servidor principal
└── package.json             # Dependencias
```

## 🔐 Seguridad

- Las contraseñas en `.env` son solo para desarrollo
- En producción, usar variables de entorno seguras
- Implementar autenticación JWT (próxima fase)
- Validar todos los inputs del usuario

## 📝 Notas

- El servidor corre por defecto en el puerto 3000
- La base de datos Oracle XE está en el puerto 1521
- El archivo DDL.sql se ejecuta automáticamente al iniciar el contenedor
- Los IDs se manejan automáticamente (sin secuencias por simplicidad)
- La API retorna datos en formato JSON con estructura estándar:
  ```json
  {
    "success": true/false,
    "data": {...},
    "message": "...",
    "error": "..."
  }
  ```

## 🐛 Troubleshooting

### Error de conexión a la base de datos
```bash
# Verificar que el contenedor esté corriendo
docker ps

# Ver logs del contenedor
docker logs oracle-xe

# Reiniciar el contenedor
docker-compose restart
```

### Puerto 3000 ya en uso
```bash
# Cambiar el puerto en .env
PORT=3001
```

## 📚 Documentación Adicional

- Ver `DDL.sql` para la estructura completa de la base de datos
- Ver `Proyecto_Fase2.pdf` para el enunciado del proyecto
- Ver `BasePractica1.sql` para referencia de la práctica original
