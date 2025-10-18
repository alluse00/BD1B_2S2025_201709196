const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

// =====================================================================
// RUTAS DEPARTAMENTO
// =====================================================================
router.get('/departamentos', mainController.getAllDepartamentos);
router.get('/departamentos/:id', mainController.getDepartamentoById);
router.post('/departamentos', mainController.createDepartamento);
router.put('/departamentos/:id', mainController.updateDepartamento);
router.delete('/departamentos/:id', mainController.deleteDepartamento);

// =====================================================================
// RUTAS MUNICIPIO
// =====================================================================
router.get('/municipios', mainController.getAllMunicipios);
router.get('/municipios/:id', mainController.getMunicipioById);
router.get('/departamentos/:id_departamento/municipios', mainController.getMunicipiosByDepartamento);
router.post('/municipios', mainController.createMunicipio);
router.put('/municipios/:id', mainController.updateMunicipio);
router.delete('/municipios/:id', mainController.deleteMunicipio);

// =====================================================================
// RUTAS CENTRO
// =====================================================================
router.get('/centros', mainController.getAllCentros);
router.get('/centros/:id', mainController.getCentroById);
router.post('/centros', mainController.createCentro);
router.put('/centros/:id', mainController.updateCentro);
router.delete('/centros/:id', mainController.deleteCentro);

// =====================================================================
// RUTAS ESCUELA
// =====================================================================
router.get('/escuelas', mainController.getAllEscuelas);
router.get('/escuelas/:id', mainController.getEscuelaById);
router.post('/escuelas', mainController.createEscuela);
router.put('/escuelas/:id', mainController.updateEscuela);
router.delete('/escuelas/:id', mainController.deleteEscuela);

// =====================================================================
// RUTAS UBICACION
// =====================================================================
router.get('/ubicaciones', mainController.getAllUbicaciones);
router.get('/ubicaciones/:id_escuela/:id_centro', mainController.getUbicacionById);
router.post('/ubicaciones', mainController.createUbicacion);
router.delete('/ubicaciones/:id_escuela/:id_centro', mainController.deleteUbicacion);

// =====================================================================
// RUTAS PREGUNTAS (TEÓRICAS)
// =====================================================================
router.get('/preguntas', mainController.getAllPreguntas);
router.get('/preguntas/:id', mainController.getPreguntaById);
router.post('/preguntas', mainController.createPregunta);
router.put('/preguntas/:id', mainController.updatePregunta);
router.delete('/preguntas/:id', mainController.deletePregunta);

// =====================================================================
// RUTAS PREGUNTAS PRÁCTICAS
// =====================================================================
router.get('/preguntas-practico', mainController.getAllPreguntasPractico);
router.get('/preguntas-practico/:id', mainController.getPreguntaPracticoById);
router.post('/preguntas-practico', mainController.createPreguntaPractico);
router.put('/preguntas-practico/:id', mainController.updatePreguntaPractico);
router.delete('/preguntas-practico/:id', mainController.deletePreguntaPractico);

module.exports = router;
