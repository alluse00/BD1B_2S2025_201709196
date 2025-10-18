const { executeQuery, executeNonQuery } = require('../config/database');

// =====================================================================
// FUNCIÓN AUXILIAR PARA MANEJO DE ERRORES
// =====================================================================
const handleDatabaseError = (error, res, entityName) => {
  console.error(`Error en ${entityName}:`, error);
  
  // Tabla no existe - Base de datos no inicializada
  if (error.message.includes('ORA-00942') || error.message.includes('table or view does not exist')) {
    return res.status(503).json({
      success: false,
      message: `La tabla de ${entityName} no existe en la base de datos. Por favor, ejecute el script DDL.sql para crear las tablas.`,
      error: 'DATABASE_NOT_INITIALIZED',
      hint: 'Ejecute: sqlplus system/password@localhost:1521/XEPDB1 @DDL.sql'
    });
  }
  
  // Constraint única violada - Registro duplicado
  if (error.message.includes('ORA-00001') || error.message.includes('unique constraint')) {
    return res.status(409).json({
      success: false,
      message: `Ya existe un registro de ${entityName} con esos datos. Verifique códigos o identificadores únicos.`,
      error: 'DUPLICATE_ENTRY'
    });
  }
  
  // Foreign key violada - Referencia inválida
  if (error.message.includes('ORA-02291') || error.message.includes('integrity constraint')) {
    return res.status(400).json({
      success: false,
      message: `Error de referencia en ${entityName}. Verifique que los IDs relacionados existan en la base de datos.`,
      error: 'FOREIGN_KEY_VIOLATION'
    });
  }
  
  // No se puede eliminar - Tiene dependencias
  if (error.message.includes('ORA-02292') || error.message.includes('child record found')) {
    return res.status(409).json({
      success: false,
      message: `No se puede eliminar ${entityName} porque tiene registros relacionados. Elimine primero las dependencias.`,
      error: 'FOREIGN_KEY_CONSTRAINT'
    });
  }
  
  // Error de conexión - Oracle no disponible
  if (error.message.includes('ORA-12541') || error.message.includes('TNS') || error.message.includes('connection')) {
    return res.status(503).json({
      success: false,
      message: 'No se pudo conectar a la base de datos. Verifique que Oracle esté en ejecución.',
      error: 'DATABASE_CONNECTION_ERROR',
      hint: 'Verifique el servicio Oracle XE o el contenedor Docker'
    });
  }
  
  // Error genérico de base de datos
  return res.status(500).json({
    success: false,
    message: `Error al procesar la solicitud de ${entityName}`,
    error: error.message.split('\n')[0] // Solo primera línea del error
  });
};

class CrudController {
  
  // =====================================================================
  // DEPARTAMENTO - CRUD
  // =====================================================================
  
  async getAllDepartamentos(req, res) {
    try {
      const result = await executeQuery(`
        SELECT * FROM DEPARTAMENTO ORDER BY nombre
      `);
      
      // Si no hay datos, retornar array vacío (no es un error)
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        message: result.rows.length === 0 ? 'No hay departamentos registrados' : undefined
      });
    } catch (error) {
      handleDatabaseError(error, res, 'departamentos');
    }
  }

  async getDepartamentoById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT * FROM DEPARTAMENTO WHERE id_departamento = :id`,
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
      handleDatabaseError(error, res, 'departamento');
    }
  }

  async createDepartamento(req, res) {
    const { nombre, codigo } = req.body;
    try {
      if (!nombre || !codigo) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y código son requeridos'
        });
      }

      const result = await executeNonQuery(
        `INSERT INTO DEPARTAMENTO (nombre, codigo) VALUES (:nombre, :codigo)`,
        [nombre, codigo]
      );

      const newDepartamento = await executeQuery(
        `SELECT * FROM DEPARTAMENTO WHERE codigo = :codigo`,
        [codigo]
      );

      res.status(201).json({
        success: true,
        message: 'Departamento creado exitosamente',
        data: newDepartamento.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'departamento');
    }
  }

  async updateDepartamento(req, res) {
    const { id } = req.params;
    const { nombre, codigo } = req.body;
    try {
      if (!nombre || !codigo) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y código son requeridos'
        });
      }

      const result = await executeNonQuery(
        `UPDATE DEPARTAMENTO SET nombre = :nombre, codigo = :codigo WHERE id_departamento = :id`,
        [nombre, codigo, id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Departamento no encontrado'
        });
      }

      const updated = await executeQuery(
        `SELECT * FROM DEPARTAMENTO WHERE id_departamento = :id`,
        [id]
      );

      res.json({
        success: true,
        message: 'Departamento actualizado exitosamente',
        data: updated.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'departamento');
    }
  }

  async deleteDepartamento(req, res) {
    const { id } = req.params;
    try {
      const result = await executeNonQuery(
        `DELETE FROM DEPARTAMENTO WHERE id_departamento = :id`,
        [id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Departamento no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Departamento eliminado exitosamente'
      });
    } catch (error) {
      handleDatabaseError(error, res, 'departamento');
    }
  }

  // =====================================================================
  // MUNICIPIO - CRUD
  // =====================================================================
  
  async getAllMunicipios(req, res) {
    try {
      const result = await executeQuery(`
        SELECT M.*, D.nombre AS departamento_nombre
        FROM MUNICIPIO M
        INNER JOIN DEPARTAMENTO D ON M.departamento_id_departamento = D.id_departamento
        ORDER BY D.nombre, M.nombre
      `);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        message: result.rows.length === 0 ? 'No hay municipios registrados' : undefined
      });
    } catch (error) {
      handleDatabaseError(error, res, 'municipios');
    }
  }

  async getMunicipioById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT M.*, D.nombre AS departamento_nombre
         FROM MUNICIPIO M
         INNER JOIN DEPARTAMENTO D ON M.departamento_id_departamento = D.id_departamento
         WHERE M.id_municipio = :id`,
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
      handleDatabaseError(error, res, 'municipio');
    }
  }

  async getMunicipiosByDepartamento(req, res) {
    const { id_departamento } = req.params;
    try {
      const result = await executeQuery(
        `SELECT * FROM MUNICIPIO WHERE departamento_id_departamento = :id ORDER BY nombre`,
        [id_departamento]
      );
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows
      });
    } catch (error) {
      console.error('Error fetching municipios by departamento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener municipios',
        error: error.message
      });
    }
  }

  async createMunicipio(req, res) {
    const { nombre, codigo, departamento_id_departamento } = req.body;
    try {
      if (!nombre || !codigo || !departamento_id_departamento) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, código y departamento son requeridos'
        });
      }

      const result = await executeNonQuery(
        `INSERT INTO MUNICIPIO (nombre, codigo, departamento_id_departamento) 
         VALUES (:nombre, :codigo, :departamento_id_departamento)`,
        [nombre, codigo, departamento_id_departamento]
      );

      const newMunicipio = await executeQuery(
        `SELECT M.*, D.nombre AS departamento_nombre
         FROM MUNICIPIO M
         INNER JOIN DEPARTAMENTO D ON M.departamento_id_departamento = D.id_departamento
         WHERE M.codigo = :codigo AND M.departamento_id_departamento = :departamento_id_departamento`,
        [codigo, departamento_id_departamento]
      );

      res.status(201).json({
        success: true,
        message: 'Municipio creado exitosamente',
        data: newMunicipio.rows[0]
      });
    } catch (error) {
      console.error('Error creating municipio:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear municipio',
        error: error.message
      });
    }
  }

  async updateMunicipio(req, res) {
    const { id } = req.params;
    const { nombre, codigo, departamento_id_departamento } = req.body;
    try {
      if (!nombre || !codigo || !departamento_id_departamento) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, código y departamento son requeridos'
        });
      }

      const result = await executeNonQuery(
        `UPDATE MUNICIPIO 
         SET nombre = :nombre, codigo = :codigo, departamento_id_departamento = :departamento_id_departamento 
         WHERE id_municipio = :id`,
        [nombre, codigo, departamento_id_departamento, id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Municipio no encontrado'
        });
      }

      const updated = await executeQuery(
        `SELECT M.*, D.nombre AS departamento_nombre
         FROM MUNICIPIO M
         INNER JOIN DEPARTAMENTO D ON M.departamento_id_departamento = D.id_departamento
         WHERE M.id_municipio = :id`,
        [id]
      );

      res.json({
        success: true,
        message: 'Municipio actualizado exitosamente',
        data: updated.rows[0]
      });
    } catch (error) {
      console.error('Error updating municipio:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar municipio',
        error: error.message
      });
    }
  }

  async deleteMunicipio(req, res) {
    const { id } = req.params;
    try {
      const result = await executeNonQuery(
        `DELETE FROM MUNICIPIO WHERE id_municipio = :id`,
        [id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Municipio no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Municipio eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting municipio:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar municipio',
        error: error.message
      });
    }
  }

  // =====================================================================
  // CENTRO - CRUD
  // =====================================================================
  
  async getAllCentros(req, res) {
    try {
      const result = await executeQuery(`
        SELECT * FROM CENTRO ORDER BY nombre
      `);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        message: result.rows.length === 0 ? 'No hay centros registrados' : undefined
      });
    } catch (error) {
      handleDatabaseError(error, res, 'centros');
    }
  }

  async getCentroById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT * FROM CENTRO WHERE id_centro = :id`,
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
        message: 'Error al obtener centro',
        error: error.message
      });
    }
  }

  async createCentro(req, res) {
    const { nombre } = req.body;
    try {
      if (!nombre) {
        return res.status(400).json({
          success: false,
          message: 'Nombre es requerido'
        });
      }

      await executeNonQuery(
        `INSERT INTO CENTRO (nombre) VALUES (:nombre)`,
        [nombre]
      );

      const newCentro = await executeQuery(
        `SELECT * FROM CENTRO WHERE nombre = :nombre ORDER BY id_centro DESC FETCH FIRST 1 ROWS ONLY`,
        [nombre]
      );

      res.status(201).json({
        success: true,
        message: 'Centro creado exitosamente',
        data: newCentro.rows[0]
      });
    } catch (error) {
      console.error('Error creating centro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear centro',
        error: error.message
      });
    }
  }

  async updateCentro(req, res) {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
      if (!nombre) {
        return res.status(400).json({
          success: false,
          message: 'Nombre es requerido'
        });
      }

      const result = await executeNonQuery(
        `UPDATE CENTRO SET nombre = :nombre WHERE id_centro = :id`,
        [nombre, id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Centro no encontrado'
        });
      }

      const updated = await executeQuery(
        `SELECT * FROM CENTRO WHERE id_centro = :id`,
        [id]
      );

      res.json({
        success: true,
        message: 'Centro actualizado exitosamente',
        data: updated.rows[0]
      });
    } catch (error) {
      console.error('Error updating centro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar centro',
        error: error.message
      });
    }
  }

  async deleteCentro(req, res) {
    const { id } = req.params;
    try {
      const result = await executeNonQuery(
        `DELETE FROM CENTRO WHERE id_centro = :id`,
        [id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Centro no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Centro eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting centro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar centro',
        error: error.message
      });
    }
  }

  // =====================================================================
  // ESCUELA - CRUD
  // =====================================================================
  
  async getAllEscuelas(req, res) {
    try {
      const result = await executeQuery(`
        SELECT * FROM ESCUELA ORDER BY nombre
      `);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        message: result.rows.length === 0 ? 'No hay escuelas registradas' : undefined
      });
    } catch (error) {
      handleDatabaseError(error, res, 'escuelas');
    }
  }

  async getEscuelaById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT * FROM ESCUELA WHERE id_escuela = :id`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Escuela no encontrada'
        });
      }
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching escuela:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener escuela',
        error: error.message
      });
    }
  }

  async createEscuela(req, res) {
    const { nombre, direccion, acuerdo } = req.body;
    try {
      if (!nombre || !direccion || !acuerdo) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, dirección y acuerdo son requeridos'
        });
      }

      await executeNonQuery(
        `INSERT INTO ESCUELA (nombre, direccion, acuerdo) VALUES (:nombre, :direccion, :acuerdo)`,
        [nombre, direccion, acuerdo]
      );

      const newEscuela = await executeQuery(
        `SELECT * FROM ESCUELA WHERE acuerdo = :acuerdo`,
        [acuerdo]
      );

      res.status(201).json({
        success: true,
        message: 'Escuela creada exitosamente',
        data: newEscuela.rows[0]
      });
    } catch (error) {
      console.error('Error creating escuela:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear escuela',
        error: error.message
      });
    }
  }

  async updateEscuela(req, res) {
    const { id } = req.params;
    const { nombre, direccion, acuerdo } = req.body;
    try {
      if (!nombre || !direccion || !acuerdo) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, dirección y acuerdo son requeridos'
        });
      }

      const result = await executeNonQuery(
        `UPDATE ESCUELA SET nombre = :nombre, direccion = :direccion, acuerdo = :acuerdo WHERE id_escuela = :id`,
        [nombre, direccion, acuerdo, id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Escuela no encontrada'
        });
      }

      const updated = await executeQuery(
        `SELECT * FROM ESCUELA WHERE id_escuela = :id`,
        [id]
      );

      res.json({
        success: true,
        message: 'Escuela actualizada exitosamente',
        data: updated.rows[0]
      });
    } catch (error) {
      console.error('Error updating escuela:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar escuela',
        error: error.message
      });
    }
  }

  async deleteEscuela(req, res) {
    const { id } = req.params;
    try {
      const result = await executeNonQuery(
        `DELETE FROM ESCUELA WHERE id_escuela = :id`,
        [id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Escuela no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Escuela eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting escuela:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar escuela',
        error: error.message
      });
    }
  }

  // =====================================================================
  // UBICACION - CRUD
  // =====================================================================
  
  async getAllUbicaciones(req, res) {
    try {
      const result = await executeQuery(`
        SELECT U.*, E.nombre AS escuela_nombre, C.nombre AS centro_nombre
        FROM UBICACION U
        INNER JOIN ESCUELA E ON U.escuela_id_escuela = E.id_escuela
        INNER JOIN CENTRO C ON U.centro_id_centro = C.id_centro
        ORDER BY E.nombre, C.nombre
      `);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        message: result.rows.length === 0 ? 'No hay ubicaciones registradas' : undefined
      });
    } catch (error) {
      handleDatabaseError(error, res, 'ubicaciones');
    }
  }

  async getUbicacionById(req, res) {
    const { id_escuela, id_centro } = req.params;
    try {
      const result = await executeQuery(
        `SELECT U.*, E.nombre AS escuela_nombre, C.nombre AS centro_nombre
         FROM UBICACION U
         INNER JOIN ESCUELA E ON U.escuela_id_escuela = E.id_escuela
         INNER JOIN CENTRO C ON U.centro_id_centro = C.id_centro
         WHERE U.escuela_id_escuela = :id_escuela AND U.centro_id_centro = :id_centro`,
        [id_escuela, id_centro]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ubicación no encontrada'
        });
      }
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching ubicacion:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ubicación',
        error: error.message
      });
    }
  }

  async createUbicacion(req, res) {
    const { escuela_id_escuela, centro_id_centro } = req.body;
    try {
      if (!escuela_id_escuela || !centro_id_centro) {
        return res.status(400).json({
          success: false,
          message: 'ID de escuela y centro son requeridos'
        });
      }

      await executeNonQuery(
        `INSERT INTO UBICACION (escuela_id_escuela, centro_id_centro) VALUES (:escuela_id_escuela, :centro_id_centro)`,
        [escuela_id_escuela, centro_id_centro]
      );

      const newUbicacion = await executeQuery(
        `SELECT U.*, E.nombre AS escuela_nombre, C.nombre AS centro_nombre
         FROM UBICACION U
         INNER JOIN ESCUELA E ON U.escuela_id_escuela = E.id_escuela
         INNER JOIN CENTRO C ON U.centro_id_centro = C.id_centro
         WHERE U.escuela_id_escuela = :escuela_id_escuela AND U.centro_id_centro = :centro_id_centro`,
        [escuela_id_escuela, centro_id_centro]
      );

      res.status(201).json({
        success: true,
        message: 'Ubicación creada exitosamente',
        data: newUbicacion.rows[0]
      });
    } catch (error) {
      console.error('Error creating ubicacion:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear ubicación',
        error: error.message
      });
    }
  }

  async deleteUbicacion(req, res) {
    const { id_escuela, id_centro } = req.params;
    try {
      const result = await executeNonQuery(
        `DELETE FROM UBICACION WHERE escuela_id_escuela = :id_escuela AND centro_id_centro = :id_centro`,
        [id_escuela, id_centro]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Ubicación no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Ubicación eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting ubicacion:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar ubicación',
        error: error.message
      });
    }
  }

  // =====================================================================
  // PREGUNTAS - CRUD
  // =====================================================================
  
  async getAllPreguntas(req, res) {
    try {
      const result = await executeQuery(`
        SELECT * FROM PREGUNTAS ORDER BY id_pregunta
      `);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        message: result.rows.length === 0 ? 'No hay preguntas registradas' : undefined
      });
    } catch (error) {
      handleDatabaseError(error, res, 'preguntas');
    }
  }

  async getPreguntaById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT * FROM PREGUNTAS WHERE id_pregunta = :id`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pregunta no encontrada'
        });
      }
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching pregunta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener pregunta',
        error: error.message
      });
    }
  }

  async createPregunta(req, res) {
    const { pregunta_texto, respuesta_a, respuesta_b, respuesta_c, respuesta_d, respuesta_correcta } = req.body;
    try {
      if (!pregunta_texto || !respuesta_a || !respuesta_b || !respuesta_c || !respuesta_d || !respuesta_correcta) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      if (!['A', 'B', 'C', 'D'].includes(respuesta_correcta)) {
        return res.status(400).json({
          success: false,
          message: 'La respuesta correcta debe ser A, B, C o D'
        });
      }

      await executeNonQuery(
        `INSERT INTO PREGUNTAS (pregunta_texto, respuesta_a, respuesta_b, respuesta_c, respuesta_d, respuesta_correcta) 
         VALUES (:pregunta_texto, :respuesta_a, :respuesta_b, :respuesta_c, :respuesta_d, :respuesta_correcta)`,
        [pregunta_texto, respuesta_a, respuesta_b, respuesta_c, respuesta_d, respuesta_correcta]
      );

      const newPregunta = await executeQuery(
        `SELECT * FROM PREGUNTAS WHERE pregunta_texto = :pregunta_texto ORDER BY id_pregunta DESC FETCH FIRST 1 ROWS ONLY`,
        [pregunta_texto]
      );

      res.status(201).json({
        success: true,
        message: 'Pregunta creada exitosamente',
        data: newPregunta.rows[0]
      });
    } catch (error) {
      console.error('Error creating pregunta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear pregunta',
        error: error.message
      });
    }
  }

  async updatePregunta(req, res) {
    const { id } = req.params;
    const { pregunta_texto, respuesta_a, respuesta_b, respuesta_c, respuesta_d, respuesta_correcta } = req.body;
    try {
      if (!pregunta_texto || !respuesta_a || !respuesta_b || !respuesta_c || !respuesta_d || !respuesta_correcta) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      if (!['A', 'B', 'C', 'D'].includes(respuesta_correcta)) {
        return res.status(400).json({
          success: false,
          message: 'La respuesta correcta debe ser A, B, C o D'
        });
      }

      const result = await executeNonQuery(
        `UPDATE PREGUNTAS 
         SET pregunta_texto = :pregunta_texto, respuesta_a = :respuesta_a, respuesta_b = :respuesta_b, 
             respuesta_c = :respuesta_c, respuesta_d = :respuesta_d, respuesta_correcta = :respuesta_correcta 
         WHERE id_pregunta = :id`,
        [pregunta_texto, respuesta_a, respuesta_b, respuesta_c, respuesta_d, respuesta_correcta, id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pregunta no encontrada'
        });
      }

      const updated = await executeQuery(
        `SELECT * FROM PREGUNTAS WHERE id_pregunta = :id`,
        [id]
      );

      res.json({
        success: true,
        message: 'Pregunta actualizada exitosamente',
        data: updated.rows[0]
      });
    } catch (error) {
      console.error('Error updating pregunta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar pregunta',
        error: error.message
      });
    }
  }

  async deletePregunta(req, res) {
    const { id } = req.params;
    try {
      const result = await executeNonQuery(
        `DELETE FROM PREGUNTAS WHERE id_pregunta = :id`,
        [id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pregunta no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Pregunta eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting pregunta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar pregunta',
        error: error.message
      });
    }
  }

  // =====================================================================
  // PREGUNTAS_PRACTICO - CRUD
  // =====================================================================
  
  async getAllPreguntasPractico(req, res) {
    try {
      const result = await executeQuery(`
        SELECT * FROM PREGUNTAS_PRACTICO ORDER BY id_pregunta_practico
      `);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        message: result.rows.length === 0 ? 'No hay preguntas prácticas registradas' : undefined
      });
    } catch (error) {
      handleDatabaseError(error, res, 'preguntas prácticas');
    }
  }

  async getPreguntaPracticoById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT * FROM PREGUNTAS_PRACTICO WHERE id_pregunta_practico = :id`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pregunta práctica no encontrada'
        });
      }
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error fetching pregunta practico:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener pregunta práctica',
        error: error.message
      });
    }
  }

  async createPreguntaPractico(req, res) {
    const { pregunta_texto, punteo } = req.body;
    try {
      if (!pregunta_texto || !punteo) {
        return res.status(400).json({
          success: false,
          message: 'Pregunta y punteo son requeridos'
        });
      }

      if (punteo < 1 || punteo > 100) {
        return res.status(400).json({
          success: false,
          message: 'El punteo debe estar entre 1 y 100'
        });
      }

      await executeNonQuery(
        `INSERT INTO PREGUNTAS_PRACTICO (pregunta_texto, punteo) VALUES (:pregunta_texto, :punteo)`,
        [pregunta_texto, punteo]
      );

      const newPregunta = await executeQuery(
        `SELECT * FROM PREGUNTAS_PRACTICO WHERE pregunta_texto = :pregunta_texto ORDER BY id_pregunta_practico DESC FETCH FIRST 1 ROWS ONLY`,
        [pregunta_texto]
      );

      res.status(201).json({
        success: true,
        message: 'Pregunta práctica creada exitosamente',
        data: newPregunta.rows[0]
      });
    } catch (error) {
      console.error('Error creating pregunta practico:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear pregunta práctica',
        error: error.message
      });
    }
  }

  async updatePreguntaPractico(req, res) {
    const { id } = req.params;
    const { pregunta_texto, punteo } = req.body;
    try {
      if (!pregunta_texto || !punteo) {
        return res.status(400).json({
          success: false,
          message: 'Pregunta y punteo son requeridos'
        });
      }

      if (punteo < 1 || punteo > 100) {
        return res.status(400).json({
          success: false,
          message: 'El punteo debe estar entre 1 y 100'
        });
      }

      const result = await executeNonQuery(
        `UPDATE PREGUNTAS_PRACTICO SET pregunta_texto = :pregunta_texto, punteo = :punteo WHERE id_pregunta_practico = :id`,
        [pregunta_texto, punteo, id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pregunta práctica no encontrada'
        });
      }

      const updated = await executeQuery(
        `SELECT * FROM PREGUNTAS_PRACTICO WHERE id_pregunta_practico = :id`,
        [id]
      );

      res.json({
        success: true,
        message: 'Pregunta práctica actualizada exitosamente',
        data: updated.rows[0]
      });
    } catch (error) {
      console.error('Error updating pregunta practico:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar pregunta práctica',
        error: error.message
      });
    }
  }

  async deletePreguntaPractico(req, res) {
    const { id } = req.params;
    try {
      const result = await executeNonQuery(
        `DELETE FROM PREGUNTAS_PRACTICO WHERE id_pregunta_practico = :id`,
        [id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Pregunta práctica no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Pregunta práctica eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting pregunta practico:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar pregunta práctica',
        error: error.message
      });
    }
  }
}

module.exports = new CrudController();
