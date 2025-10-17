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

  // =====================================================================
  // DEPARTAMENTOS Y MUNICIPIOS
  // =====================================================================

  // Obtener todos los departamentos
  async getAllDepartamentos(req, res) {
    try {
      const result = await executeQuery(`
        SELECT ID_DEPARTAMENTO, NOMBRE, CODIGO
        FROM DEPARTAMENTO
        ORDER BY NOMBRE
      `);
      
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching departamentos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los departamentos',
        error: error.message
      });
    }
  }

  // Obtener todos los municipios
  async getAllMunicipios(req, res) {
    try {
      const result = await executeQuery(`
        SELECT m.ID_MUNICIPIO, m.NOMBRE, m.CODIGO, 
               m.ID_DEPARTAMENTO, d.NOMBRE AS DEPARTAMENTO
        FROM MUNICIPIO m
        JOIN DEPARTAMENTO d ON m.ID_DEPARTAMENTO = d.ID_DEPARTAMENTO
        ORDER BY d.NOMBRE, m.NOMBRE
      `);
      
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching municipios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los municipios',
        error: error.message
      });
    }
  }

  // Obtener municipios por departamento
  async getMunicipiosByDepartamento(req, res) {
    const { id_departamento } = req.params;
    try {
      const result = await executeQuery(`
        SELECT ID_MUNICIPIO, NOMBRE, CODIGO, ID_DEPARTAMENTO
        FROM MUNICIPIO
        WHERE ID_DEPARTAMENTO = :id
        ORDER BY NOMBRE
      `, [id_departamento]);
      
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching municipios by departamento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los municipios',
        error: error.message
      });
    }
  }

  // Obtener departamento por ID
  async getDepartamentoById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT ID_DEPARTAMENTO, NOMBRE, CODIGO
         FROM DEPARTAMENTO
         WHERE ID_DEPARTAMENTO = :id`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Departamento no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching departamento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el departamento',
        error: error.message
      });
    }
  }

  // Obtener municipio por ID
  async getMunicipioById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT m.ID_MUNICIPIO, m.NOMBRE, m.CODIGO, 
                m.ID_DEPARTAMENTO, d.NOMBRE AS DEPARTAMENTO
         FROM MUNICIPIO m
         JOIN DEPARTAMENTO d ON m.ID_DEPARTAMENTO = d.ID_DEPARTAMENTO
         WHERE m.ID_MUNICIPIO = :id`,
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Municipio no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching municipio:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el municipio',
        error: error.message
      });
    }
  }

  // =====================================================================
  // MÉTODOS POST - INSERCIÓN DE DATOS
  // =====================================================================

  // Crear un nuevo departamento
  async createDepartamento(req, res) {
    try {
      const { nombre, codigo } = req.body;

      // Validar datos requeridos
      if (!nombre || !codigo) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y código son requeridos'
        });
      }

      // Obtener el siguiente ID
      const maxIdResult = await executeQuery(
        'SELECT NVL(MAX(ID_DEPARTAMENTO), 0) + 1 AS NEXT_ID FROM DEPARTAMENTO'
      );
      const nextId = maxIdResult.rows[0].NEXT_ID;

      // Insertar departamento
      const result = await executeNonQuery(
        `INSERT INTO DEPARTAMENTO (ID_DEPARTAMENTO, NOMBRE, CODIGO) 
         VALUES (:id, :nombre, :codigo)`,
        [nextId, nombre, codigo]
      );

      res.status(201).json({
        success: true,
        message: 'Departamento creado exitosamente',
        data: {
          id_departamento: nextId,
          nombre: nombre,
          codigo: codigo
        }
      });
    } catch (error) {
      console.error('Error creating departamento:', error);
      
      // Verificar si es error de duplicado
      if (error.message.includes('unique constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un departamento con ese código'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al crear el departamento',
        error: error.message
      });
    }
  }

  // Crear un nuevo municipio
  async createMunicipio(req, res) {
    try {
      const { nombre, codigo, id_departamento } = req.body;

      // Validar datos requeridos
      if (!nombre || !codigo || !id_departamento) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, código e id_departamento son requeridos'
        });
      }

      // Verificar que el departamento existe
      const deptCheck = await executeQuery(
        'SELECT ID_DEPARTAMENTO FROM DEPARTAMENTO WHERE ID_DEPARTAMENTO = :id',
        [id_departamento]
      );

      if (deptCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'El departamento especificado no existe'
        });
      }

      // Obtener el siguiente ID
      const maxIdResult = await executeQuery(
        'SELECT NVL(MAX(ID_MUNICIPIO), 0) + 1 AS NEXT_ID FROM MUNICIPIO'
      );
      const nextId = maxIdResult.rows[0].NEXT_ID;

      // Insertar municipio
      await executeNonQuery(
        `INSERT INTO MUNICIPIO (ID_MUNICIPIO, ID_DEPARTAMENTO, NOMBRE, CODIGO) 
         VALUES (:id, :id_dept, :nombre, :codigo)`,
        [nextId, id_departamento, nombre, codigo]
      );

      res.status(201).json({
        success: true,
        message: 'Municipio creado exitosamente',
        data: {
          id_municipio: nextId,
          id_departamento: id_departamento,
          nombre: nombre,
          codigo: codigo
        }
      });
    } catch (error) {
      console.error('Error creating municipio:', error);
      
      if (error.message.includes('unique constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un municipio con ese código en el departamento'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al crear el municipio',
        error: error.message
      });
    }
  }

  // Crear una nueva persona
  async createPersona(req, res) {
    try {
      const { 
        nombres, apellidos, identificacion, telefono, 
        direccion, fecha_nacimiento, genero, id_municipio 
      } = req.body;

      // Validar datos requeridos
      if (!nombres || !apellidos || !identificacion || !fecha_nacimiento || !genero || !id_municipio) {
        return res.status(400).json({
          success: false,
          message: 'Nombres, apellidos, identificación, fecha_nacimiento, género e id_municipio son requeridos'
        });
      }

      // Validar género
      if (!['M', 'F'].includes(genero)) {
        return res.status(400).json({
          success: false,
          message: 'Género debe ser M o F'
        });
      }

      // Obtener el siguiente ID
      const maxIdResult = await executeQuery(
        'SELECT NVL(MAX(ID_PERSONA), 0) + 1 AS NEXT_ID FROM PERSONA'
      );
      const nextId = maxIdResult.rows[0].NEXT_ID;

      // Insertar persona
      await executeNonQuery(
        `INSERT INTO PERSONA (
          ID_PERSONA, NOMBRES, APELLIDOS, IDENTIFICACION, 
          TELEFONO, DIRECCION, FECHA_NACIMIENTO, GENERO, 
          ID_MUNICIPIO, USUARIO_REGISTRO
        ) VALUES (
          :id, :nombres, :apellidos, :identificacion,
          :telefono, :direccion, TO_DATE(:fecha_nac, 'YYYY-MM-DD'), :genero,
          :id_municipio, 'API'
        )`,
        [nextId, nombres, apellidos, identificacion, telefono, direccion, fecha_nacimiento, genero, id_municipio]
      );

      res.status(201).json({
        success: true,
        message: 'Persona creada exitosamente',
        data: {
          id_persona: nextId,
          nombres,
          apellidos,
          identificacion
        }
      });
    } catch (error) {
      console.error('Error creating persona:', error);
      
      if (error.message.includes('unique constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una persona con esa identificación'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al crear la persona',
        error: error.message
      });
    }
  }

  // Crear un nuevo centro de evaluación
  async createCentro(req, res) {
    try {
      const { nombre, direccion, telefono, email, id_municipio } = req.body;

      // Validar datos requeridos
      if (!nombre || !direccion || !id_municipio) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, dirección e id_municipio son requeridos'
        });
      }

      // Obtener el siguiente ID
      const maxIdResult = await executeQuery(
        'SELECT NVL(MAX(ID_CENTRO), 0) + 1 AS NEXT_ID FROM CENTRO_EVALUACION'
      );
      const nextId = maxIdResult.rows[0].NEXT_ID;

      // Insertar centro
      await executeNonQuery(
        `INSERT INTO CENTRO_EVALUACION (
          ID_CENTRO, NOMBRE, DIRECCION, TELEFONO, EMAIL, 
          ID_MUNICIPIO, USUARIO_REGISTRO, ESTADO
        ) VALUES (
          :id, :nombre, :direccion, :telefono, :email,
          :id_municipio, 'API', 'A'
        )`,
        [nextId, nombre, direccion, telefono, email, id_municipio]
      );

      res.status(201).json({
        success: true,
        message: 'Centro de evaluación creado exitosamente',
        data: {
          id_centro: nextId,
          nombre,
          direccion,
          estado: 'A'
        }
      });
    } catch (error) {
      console.error('Error creating centro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el centro',
        error: error.message
      });
    }
  }

  // =====================================================================
  // MÉTODOS PUT - ACTUALIZACIÓN DE DATOS
  // =====================================================================

  // Actualizar departamento
  async updateDepartamento(req, res) {
    try {
      const { id } = req.params;
      const { nombre, codigo } = req.body;

      // Validar datos requeridos
      if (!nombre || !codigo) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y código son requeridos'
        });
      }

      // Verificar que existe
      const checkResult = await executeQuery(
        'SELECT ID_DEPARTAMENTO FROM DEPARTAMENTO WHERE ID_DEPARTAMENTO = :id',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Departamento no encontrado'
        });
      }

      // Actualizar departamento
      await executeNonQuery(
        `UPDATE DEPARTAMENTO 
         SET NOMBRE = :nombre, CODIGO = :codigo
         WHERE ID_DEPARTAMENTO = :id`,
        [nombre, codigo, id]
      );

      res.json({
        success: true,
        message: 'Departamento actualizado exitosamente',
        data: {
          id_departamento: parseInt(id),
          nombre,
          codigo
        }
      });
    } catch (error) {
      console.error('Error updating departamento:', error);
      
      if (error.message.includes('unique constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un departamento con ese código'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al actualizar el departamento',
        error: error.message
      });
    }
  }

  // Actualizar municipio
  async updateMunicipio(req, res) {
    try {
      const { id } = req.params;
      const { nombre, codigo, id_departamento } = req.body;

      // Validar datos requeridos
      if (!nombre || !codigo || !id_departamento) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, código e id_departamento son requeridos'
        });
      }

      // Verificar que existe
      const checkResult = await executeQuery(
        'SELECT ID_MUNICIPIO FROM MUNICIPIO WHERE ID_MUNICIPIO = :id',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Municipio no encontrado'
        });
      }

      // Verificar que el departamento existe
      const deptCheck = await executeQuery(
        'SELECT ID_DEPARTAMENTO FROM DEPARTAMENTO WHERE ID_DEPARTAMENTO = :id',
        [id_departamento]
      );

      if (deptCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'El departamento especificado no existe'
        });
      }

      // Actualizar municipio
      await executeNonQuery(
        `UPDATE MUNICIPIO 
         SET NOMBRE = :nombre, CODIGO = :codigo, ID_DEPARTAMENTO = :id_dept
         WHERE ID_MUNICIPIO = :id`,
        [nombre, codigo, id_departamento, id]
      );

      res.json({
        success: true,
        message: 'Municipio actualizado exitosamente',
        data: {
          id_municipio: parseInt(id),
          id_departamento,
          nombre,
          codigo
        }
      });
    } catch (error) {
      console.error('Error updating municipio:', error);
      
      if (error.message.includes('unique constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un municipio con ese código en el departamento'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al actualizar el municipio',
        error: error.message
      });
    }
  }

  // Actualizar persona
  async updatePersona(req, res) {
    try {
      const { id } = req.params;
      const { 
        nombres, apellidos, identificacion, telefono, 
        direccion, fecha_nacimiento, genero, id_municipio 
      } = req.body;

      // Validar datos requeridos
      if (!nombres || !apellidos || !identificacion || !fecha_nacimiento || !genero || !id_municipio) {
        return res.status(400).json({
          success: false,
          message: 'Nombres, apellidos, identificación, fecha_nacimiento, género e id_municipio son requeridos'
        });
      }

      // Validar género
      if (!['M', 'F'].includes(genero)) {
        return res.status(400).json({
          success: false,
          message: 'Género debe ser M o F'
        });
      }

      // Verificar que existe
      const checkResult = await executeQuery(
        'SELECT ID_PERSONA FROM PERSONA WHERE ID_PERSONA = :id',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Persona no encontrada'
        });
      }

      // Actualizar persona
      await executeNonQuery(
        `UPDATE PERSONA 
         SET NOMBRES = :nombres, APELLIDOS = :apellidos, 
             IDENTIFICACION = :identificacion, TELEFONO = :telefono,
             DIRECCION = :direccion, 
             FECHA_NACIMIENTO = TO_DATE(:fecha_nac, 'YYYY-MM-DD'),
             GENERO = :genero, ID_MUNICIPIO = :id_municipio
         WHERE ID_PERSONA = :id`,
        [nombres, apellidos, identificacion, telefono, direccion, fecha_nacimiento, genero, id_municipio, id]
      );

      res.json({
        success: true,
        message: 'Persona actualizada exitosamente',
        data: {
          id_persona: parseInt(id),
          nombres,
          apellidos,
          identificacion
        }
      });
    } catch (error) {
      console.error('Error updating persona:', error);
      
      if (error.message.includes('unique constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una persona con esa identificación'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error al actualizar la persona',
        error: error.message
      });
    }
  }

  // Actualizar centro de evaluación
  async updateCentro(req, res) {
    try {
      const { id } = req.params;
      const { nombre, direccion, telefono, email, id_municipio, estado } = req.body;

      // Validar datos requeridos
      if (!nombre || !direccion || !id_municipio) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, dirección e id_municipio son requeridos'
        });
      }

      // Validar estado si se proporciona
      if (estado && !['A', 'I'].includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado debe ser A (Activo) o I (Inactivo)'
        });
      }

      // Verificar que existe
      const checkResult = await executeQuery(
        'SELECT ID_CENTRO FROM CENTRO_EVALUACION WHERE ID_CENTRO = :id',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Centro no encontrado'
        });
      }

      // Actualizar centro
      await executeNonQuery(
        `UPDATE CENTRO_EVALUACION 
         SET NOMBRE = :nombre, DIRECCION = :direccion, 
             TELEFONO = :telefono, EMAIL = :email,
             ID_MUNICIPIO = :id_municipio, ESTADO = NVL(:estado, ESTADO)
         WHERE ID_CENTRO = :id`,
        [nombre, direccion, telefono, email, id_municipio, estado || null, id]
      );

      res.json({
        success: true,
        message: 'Centro actualizado exitosamente',
        data: {
          id_centro: parseInt(id),
          nombre,
          direccion,
          estado: estado || 'A'
        }
      });
    } catch (error) {
      console.error('Error updating centro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el centro',
        error: error.message
      });
    }
  }

  // =====================================================================
  // MÉTODOS DELETE - ELIMINACIÓN DE DATOS
  // =====================================================================

  // Eliminar departamento
  async deleteDepartamento(req, res) {
    try {
      const { id } = req.params;

      // Verificar que existe
      const checkResult = await executeQuery(
        'SELECT ID_DEPARTAMENTO FROM DEPARTAMENTO WHERE ID_DEPARTAMENTO = :id',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Departamento no encontrado'
        });
      }

      // Verificar si tiene municipios asociados
      const municipiosCheck = await executeQuery(
        'SELECT COUNT(*) AS TOTAL FROM MUNICIPIO WHERE ID_DEPARTAMENTO = :id',
        [id]
      );

      if (municipiosCheck.rows[0].TOTAL > 0) {
        return res.status(409).json({
          success: false,
          message: 'No se puede eliminar el departamento porque tiene municipios asociados'
        });
      }

      // Eliminar departamento
      await executeNonQuery(
        'DELETE FROM DEPARTAMENTO WHERE ID_DEPARTAMENTO = :id',
        [id]
      );

      res.json({
        success: true,
        message: 'Departamento eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting departamento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el departamento',
        error: error.message
      });
    }
  }

  // Eliminar municipio
  async deleteMunicipio(req, res) {
    try {
      const { id } = req.params;

      // Verificar que existe
      const checkResult = await executeQuery(
        'SELECT ID_MUNICIPIO FROM MUNICIPIO WHERE ID_MUNICIPIO = :id',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Municipio no encontrado'
        });
      }

      // Verificar si tiene registros asociados
      const personasCheck = await executeQuery(
        'SELECT COUNT(*) AS TOTAL FROM PERSONA WHERE ID_MUNICIPIO = :id',
        [id]
      );

      const centrosCheck = await executeQuery(
        'SELECT COUNT(*) AS TOTAL FROM CENTRO_EVALUACION WHERE ID_MUNICIPIO = :id',
        [id]
      );

      if (personasCheck.rows[0].TOTAL > 0 || centrosCheck.rows[0].TOTAL > 0) {
        return res.status(409).json({
          success: false,
          message: 'No se puede eliminar el municipio porque tiene registros asociados'
        });
      }

      // Eliminar municipio
      await executeNonQuery(
        'DELETE FROM MUNICIPIO WHERE ID_MUNICIPIO = :id',
        [id]
      );

      res.json({
        success: true,
        message: 'Municipio eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting municipio:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el municipio',
        error: error.message
      });
    }
  }

  // Eliminar persona
  async deletePersona(req, res) {
    try {
      const { id } = req.params;

      // Verificar que existe
      const checkResult = await executeQuery(
        'SELECT ID_PERSONA FROM PERSONA WHERE ID_PERSONA = :id',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Persona no encontrada'
        });
      }

      // Verificar si tiene evaluaciones asociadas
      const evaluacionesCheck = await executeQuery(
        'SELECT COUNT(*) AS TOTAL FROM EVALUACION WHERE ID_PERSONA = :id',
        [id]
      );

      if (evaluacionesCheck.rows[0].TOTAL > 0) {
        return res.status(409).json({
          success: false,
          message: 'No se puede eliminar la persona porque tiene evaluaciones asociadas'
        });
      }

      // Eliminar persona
      await executeNonQuery(
        'DELETE FROM PERSONA WHERE ID_PERSONA = :id',
        [id]
      );

      res.json({
        success: true,
        message: 'Persona eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting persona:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar la persona',
        error: error.message
      });
    }
  }

  // Eliminar centro de evaluación
  async deleteCentro(req, res) {
    try {
      const { id } = req.params;

      // Verificar que existe
      const checkResult = await executeQuery(
        'SELECT ID_CENTRO FROM CENTRO_EVALUACION WHERE ID_CENTRO = :id',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Centro no encontrado'
        });
      }

      // Verificar si tiene registros asociados
      const evaluacionesCheck = await executeQuery(
        'SELECT COUNT(*) AS TOTAL FROM EVALUACION WHERE ID_CENTRO = :id',
        [id]
      );

      const instructoresCheck = await executeQuery(
        'SELECT COUNT(*) AS TOTAL FROM INSTRUCTOR WHERE ID_CENTRO = :id',
        [id]
      );

      if (evaluacionesCheck.rows[0].TOTAL > 0 || instructoresCheck.rows[0].TOTAL > 0) {
        return res.status(409).json({
          success: false,
          message: 'No se puede eliminar el centro porque tiene evaluaciones o instructores asociados'
        });
      }

      // Eliminar centro
      await executeNonQuery(
        'DELETE FROM CENTRO_EVALUACION WHERE ID_CENTRO = :id',
        [id]
      );

      res.json({
        success: true,
        message: 'Centro eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting centro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el centro',
        error: error.message
      });
    }
  }
}

module.exports = new EvaluacionController();
