const express = require('express');
const router = express.Router();
const evaluacionController = require('../controllers/evaluacionController');

// =====================================================================
// RUTAS CRUD - DEPARTAMENTOS
// =====================================================================
router.get('/departamentos', evaluacionController.getAllDepartamentos);
router.get('/departamentos/:id', evaluacionController.getDepartamentoById);
router.post('/departamentos', evaluacionController.createDepartamento);
router.put('/departamentos/:id', evaluacionController.updateDepartamento);
router.delete('/departamentos/:id', evaluacionController.deleteDepartamento);

// =====================================================================
// RUTAS CRUD - MUNICIPIOS
// =====================================================================
router.get('/municipios', evaluacionController.getAllMunicipios);
router.get('/municipios/:id', evaluacionController.getMunicipioById);
router.get('/departamentos/:id_departamento/municipios', evaluacionController.getMunicipiosByDepartamento);
router.post('/municipios', evaluacionController.createMunicipio);
router.put('/municipios/:id', evaluacionController.updateMunicipio);
router.delete('/municipios/:id', evaluacionController.deleteMunicipio);

// =====================================================================
// RUTAS CRUD - CENTROS
// =====================================================================
router.get('/centros', evaluacionController.getAllCentros);
router.get('/centros/:id', evaluacionController.getCentroById);
router.get('/centros/:id_centro/dashboard', evaluacionController.getDashboardCentro);
router.post('/centros', evaluacionController.createCentro);
router.put('/centros/:id', evaluacionController.updateCentro);
router.delete('/centros/:id', evaluacionController.deleteCentro);

// =====================================================================
// RUTAS CRUD - PERSONAS
// =====================================================================
router.get('/personas', evaluacionController.getAllPersonas);
router.get('/personas/buscar/:identificacion', evaluacionController.getPersonaByIdentificacion);
router.post('/personas', evaluacionController.createPersona);
router.put('/personas/:id', evaluacionController.updatePersona);
router.delete('/personas/:id', evaluacionController.deletePersona);

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
