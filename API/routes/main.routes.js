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

// =====================================================================
// RUTAS REGISTRO
// =====================================================================
router.get('/registros', mainController.getAllRegistros);
router.get('/registros/:id', mainController.getRegistroById);
router.post('/registros', mainController.createRegistro);
router.put('/registros/:id', mainController.updateRegistro);
router.delete('/registros/:id', mainController.deleteRegistro);

// =====================================================================
// RUTAS CORRELATIVO
// =====================================================================
router.get('/correlativos', mainController.getAllCorrelativos);
router.get('/correlativos/:id', mainController.getCorrelativoById);
router.post('/correlativos', mainController.createCorrelativo);
router.put('/correlativos/:id', mainController.updateCorrelativo);
router.delete('/correlativos/:id', mainController.deleteCorrelativo);

// =====================================================================
// RUTAS EXAMEN
// =====================================================================
router.get('/examenes', mainController.getAllExamenes);
router.get('/examenes/:id', mainController.getExamenById);
router.post('/examenes', mainController.createExamen);
router.put('/examenes/:id', mainController.updateExamen);
router.delete('/examenes/:id', mainController.deleteExamen);

// =====================================================================
// RUTAS RESPUESTA_USUARIO
// =====================================================================
router.get('/respuestas-usuario', mainController.getAllRespuestasUsuario);
router.get('/respuestas-usuario/:id', mainController.getRespuestaUsuarioById);
router.post('/respuestas-usuario', mainController.createRespuestaUsuario);
router.put('/respuestas-usuario/:id', mainController.updateRespuestaUsuario);
router.delete('/respuestas-usuario/:id', mainController.deleteRespuestaUsuario);

// =====================================================================
// RUTAS RESPUESTA_PRACTICO_USUARIO
// =====================================================================
router.get('/respuestas-practico-usuario', mainController.getAllRespuestasPracticoUsuario);
router.get('/respuestas-practico-usuario/:id', mainController.getRespuestaPracticoUsuarioById);
router.post('/respuestas-practico-usuario', mainController.createRespuestaPracticoUsuario);
router.put('/respuestas-practico-usuario/:id', mainController.updateRespuestaPracticoUsuario);
router.delete('/respuestas-practico-usuario/:id', mainController.deleteRespuestaPracticoUsuario);

module.exports = router;
