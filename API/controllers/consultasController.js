const { executeQuery } = require('../config/database');

class ConsultasController {
  
  // =====================================================================
  // CONSULTA 3: Preguntas con menor porcentaje de aciertos
  // =====================================================================
  async getPreguntasMenorAciertos(req, res) {
    const { limit } = req.query;
    
    try {
      let query = `
        WITH estadisticas_preguntas AS (
          SELECT 
            P.id_pregunta,
            P.pregunta_texto,
            P.respuesta_correcta,
            P.respuesta_a,
            P.respuesta_b,
            P.respuesta_c,
            P.respuesta_d,
            COUNT(RU.respuesta) AS total_respuestas,
            SUM(CASE WHEN RU.respuesta = P.respuesta_correcta THEN 1 ELSE 0 END) AS total_aciertos,
            SUM(CASE WHEN RU.respuesta = 'A' THEN 1 ELSE 0 END) AS veces_seleccionada_a,
            SUM(CASE WHEN RU.respuesta = 'B' THEN 1 ELSE 0 END) AS veces_seleccionada_b,
            SUM(CASE WHEN RU.respuesta = 'C' THEN 1 ELSE 0 END) AS veces_seleccionada_c,
            SUM(CASE WHEN RU.respuesta = 'D' THEN 1 ELSE 0 END) AS veces_seleccionada_d
          FROM PREGUNTAS P
          LEFT JOIN RESPUESTA_USUARIO RU ON P.id_pregunta = RU.pregunta_id_pregunta
          GROUP BY P.id_pregunta, P.pregunta_texto, P.respuesta_correcta, 
                   P.respuesta_a, P.respuesta_b, P.respuesta_c, P.respuesta_d
        )
        SELECT 
          id_pregunta AS ID_PREGUNTA,
          pregunta_texto AS PREGUNTA_TEXTO,
          respuesta_correcta AS RESPUESTA_CORRECTA,
          respuesta_a AS RESPUESTA_A,
          respuesta_b AS RESPUESTA_B,
          respuesta_c AS RESPUESTA_C,
          respuesta_d AS RESPUESTA_D,
          total_respuestas AS TOTAL_RESPUESTAS,
          total_aciertos AS TOTAL_ACIERTOS,
          ROUND(
            CASE 
              WHEN total_respuestas > 0 
              THEN (total_aciertos * 100.0 / total_respuestas)
              ELSE 0 
            END, 
            2
          ) AS PORCENTAJE_ACIERTOS,
          veces_seleccionada_a AS VECES_SELECCIONADA_A,
          veces_seleccionada_b AS VECES_SELECCIONADA_B,
          veces_seleccionada_c AS VECES_SELECCIONADA_C,
          veces_seleccionada_d AS VECES_SELECCIONADA_D
        FROM estadisticas_preguntas
        ORDER BY PORCENTAJE_ACIERTOS ASC, TOTAL_RESPUESTAS DESC
      `;
      
      const params = [];
      
      if (limit) {
        query += ' FETCH FIRST :limit ROWS ONLY';
        params.push(parseInt(limit));
      }
      
      const result = await executeQuery(query, params);
      
      // Formatear respuesta
      const preguntasFormateadas = result.rows.map(pregunta => ({
        ID_PREGUNTA: pregunta.ID_PREGUNTA,
        TEXTO_PREGUNTA: pregunta.PREGUNTA_TEXTO,
        RESPUESTA_CORRECTA: pregunta.RESPUESTA_CORRECTA,
        TOTAL_RESPUESTAS: pregunta.TOTAL_RESPUESTAS,
        TOTAL_ACIERTOS: pregunta.TOTAL_ACIERTOS,
        TOTAL_ERRORES: pregunta.TOTAL_RESPUESTAS - pregunta.TOTAL_ACIERTOS,
        PORCENTAJE_ACIERTOS: pregunta.PORCENTAJE_ACIERTOS,
        ESTADO_RECOMENDACION: 
          pregunta.PORCENTAJE_ACIERTOS < 30 ? 'REVISION URGENTE' :
          pregunta.PORCENTAJE_ACIERTOS < 50 ? 'REVISAR' :
          pregunta.PORCENTAJE_ACIERTOS < 70 ? 'ACEPTABLE' : 'OK',
        OPCIONES: {
          A: {
            texto: pregunta.RESPUESTA_A,
            veces_seleccionada: pregunta.VECES_SELECCIONADA_A
          },
          B: {
            texto: pregunta.RESPUESTA_B,
            veces_seleccionada: pregunta.VECES_SELECCIONADA_B
          },
          C: {
            texto: pregunta.RESPUESTA_C,
            veces_seleccionada: pregunta.VECES_SELECCIONADA_C
          },
          D: {
            texto: pregunta.RESPUESTA_D,
            veces_seleccionada: pregunta.VECES_SELECCIONADA_D
          }
        },
        OPCION_A: pregunta.RESPUESTA_A,
        OPCION_B: pregunta.RESPUESTA_B,
        OPCION_C: pregunta.RESPUESTA_C,
        OPCION_D: pregunta.RESPUESTA_D,
        ESTADISTICAS_RESPUESTAS: {
          A: pregunta.VECES_SELECCIONADA_A,
          B: pregunta.VECES_SELECCIONADA_B,
          C: pregunta.VECES_SELECCIONADA_C,
          D: pregunta.VECES_SELECCIONADA_D
        }
      }));
      
      res.json({
        success: true,
        count: preguntasFormateadas.length,
        data: preguntasFormateadas
      });
      
    } catch (error) {
      console.error('Error fetching preguntas difíciles:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener preguntas con menor aciertos',
        error: error.message
      });
    }
  }

  // =====================================================================
  // CONSULTA 2: Ranking de Evaluados
  // =====================================================================
  async getRankingEvaluados(req, res) {
    const { resultado, tipo_licencia, genero, municipio, limit } = req.query;
    
    try {
      // Usar WITH para calcular puntajes primero
      let query = `
        WITH puntajes_teoricos AS (
          SELECT 
            RU.examen_id_examen,
            SUM(CASE WHEN RU.respuesta = P.respuesta_correcta THEN 1 ELSE 0 END) AS correctas,
            COUNT(*) AS total
          FROM RESPUESTA_USUARIO RU
          INNER JOIN PREGUNTAS P ON RU.pregunta_id_pregunta = P.id_pregunta
          GROUP BY RU.examen_id_examen
        ),
        puntajes_practicos AS (
          SELECT 
            RPU.examen_id_examen,
            SUM(RPU.nota) AS total_notas,
            SUM(PP.punteo) AS total_punteos
          FROM RESPUESTA_PRACTICO_USUARIO RPU
          INNER JOIN PREGUNTAS_PRACTICO PP ON RPU.pregunta_practico_id_pregunta_practico = PP.id_pregunta_practico
          GROUP BY RPU.examen_id_examen
        ),
        puntajes AS (
          SELECT 
            EX.id_examen,
            EX.registro_id_registro,
            EX.registro_id_centro,
            NVL(ROUND(PT.correctas * 100.0 / NULLIF(PT.total, 0), 2), 0) AS puntaje_teorico,
            NVL(ROUND(PP.total_notas * 100.0 / NULLIF(PP.total_punteos, 0), 2), 0) AS puntaje_practico
          FROM EXAMEN EX
          LEFT JOIN puntajes_teoricos PT ON EX.id_examen = PT.examen_id_examen
          LEFT JOIN puntajes_practicos PP ON EX.id_examen = PP.examen_id_examen
        )
        SELECT 
          R.nombre_completo AS NOMBRE_COMPLETO,
          R.tipo_licencia AS TIPO_LICENCIA,
          CASE R.genero 
            WHEN 'M' THEN 'Masculino'
            WHEN 'F' THEN 'Femenino'
            ELSE R.genero
          END AS GENERO,
          R.fecha AS FECHA,
          TO_CHAR(R.fecha, 'DD/MM/YYYY') AS FECHA_FORMATO,
          P.puntaje_teorico AS PUNTAJE_TEORICO,
          P.puntaje_practico AS PUNTAJE_PRACTICO,
          ROUND((P.puntaje_teorico + P.puntaje_practico) / 2, 2) AS PUNTAJE_TOTAL,
          CASE 
            WHEN P.puntaje_teorico >= 70 AND P.puntaje_practico >= 70 THEN 'APROBADO'
            ELSE 'REPROBADO'
          END AS RESULTADO,
          C.nombre AS CENTRO_EVALUACION,
          M.nombre AS MUNICIPIO,
          D.nombre AS DEPARTAMENTO,
          M.nombre || ', ' || D.nombre AS UBICACION
        FROM puntajes P
        INNER JOIN REGISTRO R ON P.registro_id_registro = R.id_registro
        INNER JOIN CENTRO C ON P.registro_id_centro = C.id_centro
        INNER JOIN MUNICIPIO M ON R.municipio_id_municipio = M.id_municipio
        INNER JOIN DEPARTAMENTO D ON M.departamento_id_departamento = D.id_departamento
        WHERE 1=1
      `;
      
      const params = [];
      
      if (resultado) {
        if (resultado.toUpperCase() === 'APROBADO') {
          query += ` AND P.puntaje_teorico >= 70 AND P.puntaje_practico >= 70`;
        } else if (resultado.toUpperCase() === 'REPROBADO') {
          query += ` AND NOT (P.puntaje_teorico >= 70 AND P.puntaje_practico >= 70)`;
        }
      }
      
      if (tipo_licencia) {
        query += ' AND UPPER(R.tipo_licencia) = UPPER(:tipo_licencia)';
        params.push(tipo_licencia);
      }
      
      if (genero) {
        query += ' AND UPPER(R.genero) = UPPER(:genero)';
        params.push(genero);
      }
      
      if (municipio) {
        query += ' AND UPPER(M.nombre) LIKE UPPER(:municipio)';
        params.push(`%${municipio}%`);
      }
      
      query += `
        ORDER BY 
          CASE 
            WHEN P.puntaje_teorico >= 70 AND P.puntaje_practico >= 70 THEN 0
            ELSE 1
          END,
          ROUND((P.puntaje_teorico + P.puntaje_practico) / 2, 2) DESC
      `;
      
      if (limit) {
        query += ' FETCH FIRST :limit ROWS ONLY';
        params.push(parseInt(limit));
      }
      
      const result = await executeQuery(query, params);
      
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
      
    } catch (error) {
      console.error('Error fetching ranking evaluados:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ranking de evaluados',
        error: error.message
      });
    }
  }

  // =====================================================================
  // CONSULTA 1: Estadísticas por Centro y Escuela
  // =====================================================================
  async getEstadisticasCentroEscuela(req, res) {
    const { centro, escuela, limit } = req.query;
    
    try {
      // Usar WITH para calcular puntajes primero con LEFT JOIN
      let query = `
        WITH puntajes_teoricos AS (
          SELECT 
            RU.examen_id_examen,
            SUM(CASE WHEN RU.respuesta = P.respuesta_correcta THEN 1 ELSE 0 END) AS correctas,
            COUNT(*) AS total
          FROM RESPUESTA_USUARIO RU
          INNER JOIN PREGUNTAS P ON RU.pregunta_id_pregunta = P.id_pregunta
          GROUP BY RU.examen_id_examen
        ),
        puntajes_practicos AS (
          SELECT 
            RPU.examen_id_examen,
            SUM(RPU.nota) AS total_notas,
            SUM(PP.punteo) AS total_punteos
          FROM RESPUESTA_PRACTICO_USUARIO RPU
          INNER JOIN PREGUNTAS_PRACTICO PP ON RPU.pregunta_practico_id_pregunta_practico = PP.id_pregunta_practico
          GROUP BY RPU.examen_id_examen
        ),
        puntajes_examen AS (
          SELECT 
            EX.id_examen,
            EX.registro_id_centro,
            EX.registro_id_escuela,
            NVL(ROUND(PT.correctas * 100.0 / NULLIF(PT.total, 0), 2), 0) AS puntaje_teorico,
            NVL(ROUND(PP.total_notas * 100.0 / NULLIF(PP.total_punteos, 0), 2), 0) AS puntaje_practico
          FROM EXAMEN EX
          LEFT JOIN puntajes_teoricos PT ON EX.id_examen = PT.examen_id_examen
          LEFT JOIN puntajes_practicos PP ON EX.id_examen = PP.examen_id_examen
        )
        SELECT 
          C.nombre AS CENTRO,
          E.nombre AS ESCUELA,
          COUNT(P.id_examen) AS TOTAL_EXAMENES,
          ROUND(AVG(P.puntaje_teorico), 2) AS PROMEDIO_TEORICO,
          ROUND(AVG(P.puntaje_practico), 2) AS PROMEDIO_PRACTICO,
          SUM(CASE WHEN P.puntaje_teorico >= 70 AND P.puntaje_practico >= 70 THEN 1 ELSE 0 END) AS TOTAL_APROBADOS,
          ROUND(
            SUM(CASE WHEN P.puntaje_teorico >= 70 AND P.puntaje_practico >= 70 THEN 1 ELSE 0 END) * 100.0 
            / NULLIF(COUNT(P.id_examen), 0)
          , 2) AS PORCENTAJE_APROBACION
        FROM puntajes_examen P
        INNER JOIN CENTRO C ON P.registro_id_centro = C.id_centro
        INNER JOIN ESCUELA E ON P.registro_id_escuela = E.id_escuela
        WHERE 1=1
      `;
      
      const params = [];
      
      if (centro) {
        query += ' AND UPPER(C.nombre) LIKE UPPER(:centro)';
        params.push(`%${centro}%`);
      }
      
      if (escuela) {
        query += ' AND UPPER(E.nombre) LIKE UPPER(:escuela)';
        params.push(`%${escuela}%`);
      }
      
      query += `
        GROUP BY C.nombre, E.nombre
        ORDER BY TOTAL_EXAMENES DESC, PORCENTAJE_APROBACION DESC
      `;
      
      if (limit) {
        query += ' FETCH FIRST :limit ROWS ONLY';
        params.push(parseInt(limit));
      }
      
      const result = await executeQuery(query, params);
      
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
      
    } catch (error) {
      console.error('Error fetching estadísticas centro-escuela:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas por centro y escuela',
        error: error.message
      });
    }
  }
}

module.exports = new ConsultasController();
