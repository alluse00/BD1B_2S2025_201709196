const express = require('express');
const router = express.Router();
const evaluacionController = require('../controllers/evaluacionController');

// =====================================================================
// RUTAS DE CENTROS
// =====================================================================
router.get('/centros', evaluacionController.getAllCentros);
router.get('/centros/:id', evaluacionController.getCentroById);
router.get('/centros/:id_centro/dashboard', evaluacionController.getDashboardCentro);

// =====================================================================
// RUTAS DE PERSONAS
// =====================================================================
router.get('/personas', evaluacionController.getAllPersonas);
router.get('/personas/buscar/:identificacion', evaluacionController.getPersonaByIdentificacion);

// =====================================================================
// RUTAS DE EVALUACIONES
// =====================================================================
router.get('/evaluaciones', evaluacionController.getAllEvaluaciones);
router.get('/evaluaciones/:id', evaluacionController.getEvaluacionById);

// =====================================================================
// RUTAS DE ESTADÍSTICAS
// =====================================================================
router.get('/estadisticas/diarias', evaluacionController.getEstadisticasDiarias);

// =====================================================================
// RUTAS DE CATÁLOGOS
// =====================================================================
router.get('/tipos-licencia', evaluacionController.getTiposLicencia);
router.get('/tipos-tramite', evaluacionController.getTiposTramite);

// =====================================================================
// RUTAS DE PREGUNTAS
// =====================================================================
router.get('/preguntas/teoricas', evaluacionController.getPreguntasTeorica);
router.get('/preguntas/teoricas/:id', evaluacionController.getPreguntaConRespuestas);

module.exports = router;
