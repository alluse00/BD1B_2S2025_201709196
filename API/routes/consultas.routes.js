const express = require('express');
const router = express.Router();
const consultasController = require('../controllers/consultasController');

// =====================================================================
// CONSULTAS / ESTADÍSTICAS
// =====================================================================

// CONSULTA 1: Estadísticas por centro y escuela
router.get('/estadisticas/centro-escuela', consultasController.getEstadisticasCentroEscuela);

// CONSULTA 2: Ranking de evaluados
router.get('/estadisticas/ranking-evaluados', consultasController.getRankingEvaluados);

// CONSULTA 3: Preguntas con menor aciertos (difíciles)
router.get('/estadisticas/preguntas-dificiles', consultasController.getPreguntasMenorAciertos);

module.exports = router;
