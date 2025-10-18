const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/database');

// Cargar variables de entorno
dotenv.config();

// Crear aplicación Express
const app = express();

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para CORS (opcional, pero recomendado)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Importar rutas
const consultasRoutes = require('./routes/consultas.routes');
const mainRoutes = require('./routes/main.routes');

// Usar rutas
app.use('/api', consultasRoutes);
app.use('/api', mainRoutes);

// Ruta de prueba básica
app.get('/', (req, res) => {
  res.json({
    message: 'API de Sistema de Control de Evaluaciones de Centros de Manejo',
    version: '2.0.0',
    status: 'Activo',
    proyecto: 'Proyecto Fase 2 - BD1',
    carnet: '201709196',
    descripcion: 'Sistema compatible con datos.json - Estructura simplificada',
    endpoints: {
      test: '/api/test',
      health: '/health',
      consultas: {
        estadisticasCentroEscuela: '/api/estadisticas/centro-escuela',
        rankingEvaluados: '/api/estadisticas/ranking-evaluados',
        preguntasDificiles: '/api/estadisticas/preguntas-dificiles'
      },
      crud: {
        departamentos: '/api/departamentos',
        municipios: '/api/municipios',
        centros: '/api/centros',
        escuelas: '/api/escuelas',
        ubicaciones: '/api/ubicaciones',
        preguntas: '/api/preguntas',
        preguntasPractico: '/api/preguntas-practico'
      }
    },
    documentacion: {
      consulta1: 'Estadísticas de aprobación por centro y escuela',
      consulta2: 'Ranking de evaluados ordenados por resultado y puntaje',
      consulta3: 'Preguntas con menor porcentaje de aciertos',
      crud: 'Endpoints CRUD disponibles para todas las tablas (GET, POST, PUT, DELETE)'
    }
  });
});

// Ruta de prueba de conexión a la base de datos
app.get('/api/test', async (req, res) => {
  try {
    const result = await db.executeQuery('SELECT 1 FROM DUAL');
    res.json({
      success: true,
      message: 'Conexión a la base de datos exitosa',
      data: result.rows
    });
  } catch (error) {
    console.error('Error en la prueba de conexión:', error);
    res.status(500).json({
      success: false,
      message: 'Error al conectar con la base de datos',
      error: error.message
    });
  }
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.path
  });
});

// Middleware para manejo de errores global
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error : {}
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log('===========================================');
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Base de datos: Oracle XE`);
  console.log(`Connection: ${process.env.DB_CONNECTION_STRING}`);
  console.log('===========================================');
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n  Cerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n  Cerrando servidor...');
  process.exit(0);
});

module.exports = app;
