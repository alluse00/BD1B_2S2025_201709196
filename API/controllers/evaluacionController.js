const { executeQuery, executeNonQuery } = require('../config/database');

class EvaluacionController {
  
  // =====================================================================
  // CENTRO DE EVALUACIÓN
  // =====================================================================
  
  // Obtener todos los centros
  async getAllCentros(req, res) {
    try {
      const result = await executeQuery(`
        SELECT c.*, m.NOMBRE AS MUNICIPIO, d.NOMBRE AS DEPARTAMENTO
        FROM CENTRO_EVALUACION c
        JOIN MUNICIPIO m ON c.ID_MUNICIPIO = m.ID_MUNICIPIO
        JOIN DEPARTAMENTO d ON m.ID_DEPARTAMENTO = d.ID_DEPARTAMENTO
        ORDER BY c.ID_CENTRO
      `);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching centros:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los centros',
        error: error.message
      });
    }
  }

  // Obtener centro por ID
  async getCentroById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT c.*, m.NOMBRE AS MUNICIPIO, d.NOMBRE AS DEPARTAMENTO
         FROM CENTRO_EVALUACION c
         JOIN MUNICIPIO m ON c.ID_MUNICIPIO = m.ID_MUNICIPIO
         JOIN DEPARTAMENTO d ON m.ID_DEPARTAMENTO = d.ID_DEPARTAMENTO
         WHERE c.ID_CENTRO = :id`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Centro no encontrado'
        });
      }
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching centro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el centro',
        error: error.message
      });
    }
  }

  // =====================================================================
  // PERSONA
  // =====================================================================

  // Obtener todas las personas
  async getAllPersonas(req, res) {
    try {
      const result = await executeQuery(`
        SELECT p.*, m.NOMBRE AS MUNICIPIO, d.NOMBRE AS DEPARTAMENTO
        FROM PERSONA p
        JOIN MUNICIPIO m ON p.ID_MUNICIPIO = m.ID_MUNICIPIO
        JOIN DEPARTAMENTO d ON m.ID_DEPARTAMENTO = d.ID_DEPARTAMENTO
        ORDER BY p.ID_PERSONA DESC
      `);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching personas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las personas',
        error: error.message
      });
    }
  }

  // Buscar persona por identificación
  async getPersonaByIdentificacion(req, res) {
    const { identificacion } = req.params;
    try {
      const result = await executeQuery(
        `SELECT p.*, m.NOMBRE AS MUNICIPIO, d.NOMBRE AS DEPARTAMENTO
         FROM PERSONA p
         JOIN MUNICIPIO m ON p.ID_MUNICIPIO = m.ID_MUNICIPIO
         JOIN DEPARTAMENTO d ON m.ID_DEPARTAMENTO = d.ID_DEPARTAMENTO
         WHERE p.IDENTIFICACION = :identificacion`,
        [identificacion]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Persona no encontrada'
        });
      }
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching persona:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la persona',
        error: error.message
      });
    }
  }

  // =====================================================================
  // EVALUACIÓN
  // =====================================================================

  // Obtener todas las evaluaciones
  async getAllEvaluaciones(req, res) {
    try {
      const { id_centro, fecha_inicio, fecha_fin, resultado } = req.query;
      
      let query = `
        SELECT e.*, 
               p.NOMBRES || ' ' || p.APELLIDOS AS NOMBRE_PERSONA,
               p.IDENTIFICACION,
               c.NOMBRE AS CENTRO,
               es.NOMBRE AS ESCUELA,
               tl.DESCRIPCION AS TIPO_LICENCIA,
               tt.DESCRIPCION AS TIPO_TRAMITE,
               i.NOMBRES || ' ' || i.APELLIDOS AS INSTRUCTOR
        FROM EVALUACION e
        JOIN PERSONA p ON e.ID_PERSONA = p.ID_PERSONA
        JOIN CENTRO_EVALUACION c ON e.ID_CENTRO = c.ID_CENTRO
        JOIN ESCUELA_AUTOMOVILISMO es ON e.ID_ESCUELA = es.ID_ESCUELA
        JOIN TIPO_LICENCIA tl ON e.ID_TIPO_LICENCIA = tl.ID_TIPO_LICENCIA
        JOIN TIPO_TRAMITE tt ON e.ID_TIPO_TRAMITE = tt.ID_TIPO_TRAMITE
        JOIN INSTRUCTOR i ON e.ID_INSTRUCTOR = i.ID_INSTRUCTOR
        WHERE 1=1
      `;
      
      const params = [];
      
      if (id_centro) {
        query += ' AND e.ID_CENTRO = :id_centro';
        params.push(id_centro);
      }
      
      if (fecha_inicio) {
        query += ' AND e.FECHA_EVALUACION >= TO_DATE(:fecha_inicio, \'YYYY-MM-DD\')';
        params.push(fecha_inicio);
      }
      
      if (fecha_fin) {
        query += ' AND e.FECHA_EVALUACION <= TO_DATE(:fecha_fin, \'YYYY-MM-DD\')';
        params.push(fecha_fin);
      }
      
      if (resultado) {
        query += ' AND e.RESULTADO_FINAL = :resultado';
        params.push(resultado);
      }
      
      query += ' ORDER BY e.FECHA_EVALUACION DESC, e.CORRELATIVO_DIARIO DESC';
      
      const result = await executeQuery(query, params);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching evaluaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las evaluaciones',
        error: error.message
      });
    }
  }

  // Obtener evaluación por ID
  async getEvaluacionById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT e.*, 
                p.NOMBRES || ' ' || p.APELLIDOS AS NOMBRE_PERSONA,
                p.IDENTIFICACION,
                p.FECHA_NACIMIENTO,
                c.NOMBRE AS CENTRO,
                es.NOMBRE AS ESCUELA,
                tl.CODIGO AS CODIGO_LICENCIA,
                tl.DESCRIPCION AS TIPO_LICENCIA,
                tt.DESCRIPCION AS TIPO_TRAMITE,
                i.NOMBRES || ' ' || i.APELLIDOS AS INSTRUCTOR
         FROM EVALUACION e
         JOIN PERSONA p ON e.ID_PERSONA = p.ID_PERSONA
         JOIN CENTRO_EVALUACION c ON e.ID_CENTRO = c.ID_CENTRO
         JOIN ESCUELA_AUTOMOVILISMO es ON e.ID_ESCUELA = es.ID_ESCUELA
         JOIN TIPO_LICENCIA tl ON e.ID_TIPO_LICENCIA = tl.ID_TIPO_LICENCIA
         JOIN TIPO_TRAMITE tt ON e.ID_TIPO_TRAMITE = tt.ID_TIPO_TRAMITE
         JOIN INSTRUCTOR i ON e.ID_INSTRUCTOR = i.ID_INSTRUCTOR
         WHERE e.ID_EVALUACION = :id`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Evaluación no encontrada'
        });
      }
      
      // Obtener detalles teóricos
      const detallesTeoric = await executeQuery(
        `SELECT dt.*, pt.TEXTO_PREGUNTA, rt.TEXTO_RESPUESTA, rt.ES_CORRECTA
         FROM DETALLE_EVALUACION_TEORICA dt
         JOIN PREGUNTA_TEORICA pt ON dt.ID_PREGUNTA = pt.ID_PREGUNTA
         JOIN RESPUESTA_TEORICA rt ON dt.ID_RESPUESTA_DADA = rt.ID_RESPUESTA
         WHERE dt.ID_EVALUACION = :id
         ORDER BY dt.ID_DETALLE_TEORICO`,
        [id]
      );
      
      // Obtener detalles prácticos
      const detallesPracticos = await executeQuery(
        `SELECT dp.*, pp.DESCRIPCION, pp.PUNTOS_MAX
         FROM DETALLE_EVALUACION_PRACTICA dp
         JOIN PREGUNTA_PRACTICA pp ON dp.ID_PREGUNTA_PRACTICA = pp.ID_PREGUNTA_PRACTICA
         WHERE dp.ID_EVALUACION = :id
         ORDER BY dp.ID_DETALLE_PRACTICO`,
        [id]
      );
      
      res.json({
        success: true,
        data: {
          evaluacion: result.rows[0],
          detalles_teoricos: detallesTeoric.rows,
          detalles_practicos: detallesPracticos.rows
        }
      });
    } catch (error) {
      console.error('Error fetching evaluacion:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la evaluación',
        error: error.message
      });
    }
  }

  // =====================================================================
  // ESTADÍSTICAS
  // =====================================================================

  // Obtener estadísticas diarias
  async getEstadisticasDiarias(req, res) {
    const { id_centro, fecha } = req.query;
    
    try {
      let query = `
        SELECT ed.*, c.NOMBRE AS CENTRO
        FROM ESTADISTICAS_DIARIAS ed
        JOIN CENTRO_EVALUACION c ON ed.ID_CENTRO = c.ID_CENTRO
        WHERE 1=1
      `;
      
      const params = [];
      
      if (id_centro) {
        query += ' AND ed.ID_CENTRO = :id_centro';
        params.push(id_centro);
      }
      
      if (fecha) {
        query += ' AND ed.FECHA = TO_DATE(:fecha, \'YYYY-MM-DD\')';
        params.push(fecha);
      }
      
      query += ' ORDER BY ed.FECHA DESC, ed.ID_CENTRO';
      
      const result = await executeQuery(query, params);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching estadisticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las estadísticas',
        error: error.message
      });
    }
  }

  // Dashboard de centro
  async getDashboardCentro(req, res) {
    const { id_centro } = req.params;
    
    try {
      // Total de evaluaciones
      const totalEval = await executeQuery(
        `SELECT COUNT(*) AS TOTAL FROM EVALUACION WHERE ID_CENTRO = :id`,
        [id_centro]
      );
      
      // Evaluaciones del día
      const evalHoy = await executeQuery(
        `SELECT COUNT(*) AS TOTAL FROM EVALUACION 
         WHERE ID_CENTRO = :id AND TRUNC(FECHA_EVALUACION) = TRUNC(SYSDATE)`,
        [id_centro]
      );
      
      // Aprobados vs Reprobados
      const resultados = await executeQuery(
        `SELECT RESULTADO_FINAL, COUNT(*) AS TOTAL 
         FROM EVALUACION 
         WHERE ID_CENTRO = :id AND RESULTADO_FINAL IS NOT NULL
         GROUP BY RESULTADO_FINAL`,
        [id_centro]
      );
      
      // Promedios por tipo de licencia
      const promedios = await executeQuery(
        `SELECT tl.DESCRIPCION, 
                AVG(e.PUNTAJE_TEORICO) AS PROM_TEORICO,
                AVG(e.PUNTAJE_PRACTICO) AS PROM_PRACTICO,
                AVG(e.PUNTAJE_TOTAL) AS PROM_TOTAL,
                COUNT(*) AS TOTAL_EVALUACIONES
         FROM EVALUACION e
         JOIN TIPO_LICENCIA tl ON e.ID_TIPO_LICENCIA = tl.ID_TIPO_LICENCIA
         WHERE e.ID_CENTRO = :id
         GROUP BY tl.DESCRIPCION
         ORDER BY TOTAL_EVALUACIONES DESC`,
        [id_centro]
      );
      
      res.json({
        success: true,
        data: {
          total_evaluaciones: totalEval.rows[0].TOTAL,
          evaluaciones_hoy: evalHoy.rows[0].TOTAL,
          resultados: resultados.rows,
          promedios_por_tipo: promedios.rows
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el dashboard',
        error: error.message
      });
    }
  }

  // =====================================================================
  // TIPOS DE LICENCIA Y TRÁMITE
  // =====================================================================

  // Obtener tipos de licencia
  async getTiposLicencia(req, res) {
    try {
      const result = await executeQuery(
        'SELECT * FROM TIPO_LICENCIA ORDER BY CODIGO'
      );
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching tipos licencia:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los tipos de licencia',
        error: error.message
      });
    }
  }

  // Obtener tipos de trámite
  async getTiposTramite(req, res) {
    try {
      const result = await executeQuery(
        'SELECT * FROM TIPO_TRAMITE ORDER BY CODIGO'
      );
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching tipos tramite:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los tipos de trámite',
        error: error.message
      });
    }
  }

  // =====================================================================
  // PREGUNTAS TEÓRICAS
  // =====================================================================

  // Obtener preguntas teóricas
  async getPreguntasTeorica(req, res) {
    const { id_tipo_licencia, estado } = req.query;
    
    try {
      let query = `
        SELECT pt.*, tl.DESCRIPCION AS TIPO_LICENCIA
        FROM PREGUNTA_TEORICA pt
        JOIN TIPO_LICENCIA tl ON pt.ID_TIPO_LICENCIA = tl.ID_TIPO_LICENCIA
        WHERE 1=1
      `;
      
      const params = [];
      
      if (id_tipo_licencia) {
        query += ' AND pt.ID_TIPO_LICENCIA = :id_tipo';
        params.push(id_tipo_licencia);
      }
      
      if (estado) {
        query += ' AND pt.ESTADO = :estado';
        params.push(estado);
      }
      
      query += ' ORDER BY pt.ID_PREGUNTA';
      
      const result = await executeQuery(query, params);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching preguntas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las preguntas',
        error: error.message
      });
    }
  }

  // Obtener pregunta con respuestas
  async getPreguntaConRespuestas(req, res) {
    const { id } = req.params;
    
    try {
      const pregunta = await executeQuery(
        `SELECT pt.*, tl.DESCRIPCION AS TIPO_LICENCIA
         FROM PREGUNTA_TEORICA pt
         JOIN TIPO_LICENCIA tl ON pt.ID_TIPO_LICENCIA = tl.ID_TIPO_LICENCIA
         WHERE pt.ID_PREGUNTA = :id`,
        [id]
      );
      
      if (pregunta.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pregunta no encontrada'
        });
      }
      
      const respuestas = await executeQuery(
        `SELECT * FROM RESPUESTA_TEORICA 
         WHERE ID_PREGUNTA = :id 
         ORDER BY ORDEN_RESPUESTA`,
        [id]
      );
      
      res.json({
        success: true,
        data: {
          pregunta: pregunta.rows[0],
          respuestas: respuestas.rows
        }
      });
    } catch (error) {
      console.error('Error fetching pregunta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la pregunta',
        error: error.message
      });
    }
  }
}

module.exports = new EvaluacionController();
