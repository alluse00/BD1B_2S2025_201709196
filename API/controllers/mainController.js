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

  // =====================================================================
  // REGISTRO - CRUD
  // =====================================================================
  
  async getAllRegistros(req, res) {
    try {
      const result = await executeQuery(`
        SELECT R.*, 
               E.nombre AS escuela_nombre,
               C.nombre AS centro_nombre,
               M.nombre AS municipio_nombre,
               D.nombre AS departamento_nombre
        FROM REGISTRO R
        LEFT JOIN ESCUELA E ON R.ubicacion_escuela_id_escuela = E.id_escuela
        LEFT JOIN CENTRO C ON R.ubicacion_centro_id_centro = C.id_centro
        LEFT JOIN MUNICIPIO M ON R.municipio_id_municipio = M.id_municipio
        LEFT JOIN DEPARTAMENTO D ON R.municipio_departamento_id_departamento = D.id_departamento
        ORDER BY R.fecha DESC, R.nombre_completo
      `);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        message: result.rows.length === 0 ? 'No hay registros' : undefined
      });
    } catch (error) {
      handleDatabaseError(error, res, 'registros');
    }
  }

  async getRegistroById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT R.*, 
                E.nombre AS escuela_nombre,
                C.nombre AS centro_nombre,
                M.nombre AS municipio_nombre,
                D.nombre AS departamento_nombre
         FROM REGISTRO R
         LEFT JOIN ESCUELA E ON R.ubicacion_escuela_id_escuela = E.id_escuela
         LEFT JOIN CENTRO C ON R.ubicacion_centro_id_centro = C.id_centro
         LEFT JOIN MUNICIPIO M ON R.municipio_id_municipio = M.id_municipio
         LEFT JOIN DEPARTAMENTO D ON R.municipio_departamento_id_departamento = D.id_departamento
         WHERE R.id_registro = :id`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Registro no encontrado'
        });
      }
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'registro');
    }
  }

  async createRegistro(req, res) {
    const { 
      ubicacion_escuela_id_escuela, 
      ubicacion_centro_id_centro, 
      municipio_id_municipio, 
      municipio_departamento_id_departamento,
      fecha,
      tipo_tramite,
      tipo_licencia,
      nombre_completo,
      genero
    } = req.body;
    
    try {
      if (!ubicacion_escuela_id_escuela || !ubicacion_centro_id_centro || !municipio_id_municipio || 
          !municipio_departamento_id_departamento || !fecha || !tipo_tramite || !tipo_licencia || 
          !nombre_completo || !genero) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      const result = await executeNonQuery(
        `INSERT INTO REGISTRO (
          ubicacion_escuela_id_escuela, ubicacion_centro_id_centro, 
          municipio_id_municipio, municipio_departamento_id_departamento,
          fecha, tipo_tramite, tipo_licencia, nombre_completo, genero
         ) VALUES (:1, :2, :3, :4, TO_DATE(:5, 'YYYY-MM-DD'), :6, :7, :8, :9)`,
        [ubicacion_escuela_id_escuela, ubicacion_centro_id_centro, municipio_id_municipio, 
         municipio_departamento_id_departamento, fecha, tipo_tramite, tipo_licencia, nombre_completo, genero]
      );

      const newRegistro = await executeQuery(
        `SELECT R.*, 
                E.nombre AS escuela_nombre,
                C.nombre AS centro_nombre,
                M.nombre AS municipio_nombre,
                D.nombre AS departamento_nombre
         FROM REGISTRO R
         LEFT JOIN ESCUELA E ON R.ubicacion_escuela_id_escuela = E.id_escuela
         LEFT JOIN CENTRO C ON R.ubicacion_centro_id_centro = C.id_centro
         LEFT JOIN MUNICIPIO M ON R.municipio_id_municipio = M.id_municipio
         LEFT JOIN DEPARTAMENTO D ON R.municipio_departamento_id_departamento = D.id_departamento
         WHERE R.nombre_completo = :nombre_completo AND R.fecha = TO_DATE(:fecha, 'YYYY-MM-DD')
         ORDER BY R.id_registro DESC`,
        [nombre_completo, fecha]
      );

      res.status(201).json({
        success: true,
        message: 'Registro creado exitosamente',
        data: newRegistro.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'registro');
    }
  }

  async updateRegistro(req, res) {
    const { id } = req.params;
    const { 
      ubicacion_escuela_id_escuela, 
      ubicacion_centro_id_centro, 
      municipio_id_municipio, 
      municipio_departamento_id_departamento,
      fecha,
      tipo_tramite,
      tipo_licencia,
      nombre_completo,
      genero
    } = req.body;
    
    try {
      if (!ubicacion_escuela_id_escuela || !ubicacion_centro_id_centro || !municipio_id_municipio || 
          !municipio_departamento_id_departamento || !fecha || !tipo_tramite || !tipo_licencia || 
          !nombre_completo || !genero) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      const result = await executeNonQuery(
        `UPDATE REGISTRO SET 
          ubicacion_escuela_id_escuela = :1, 
          ubicacion_centro_id_centro = :2, 
          municipio_id_municipio = :3, 
          municipio_departamento_id_departamento = :4,
          fecha = TO_DATE(:5, 'YYYY-MM-DD'), 
          tipo_tramite = :6, 
          tipo_licencia = :7, 
          nombre_completo = :8, 
          genero = :9
         WHERE id_registro = :10`,
        [ubicacion_escuela_id_escuela, ubicacion_centro_id_centro, municipio_id_municipio, 
         municipio_departamento_id_departamento, fecha, tipo_tramite, tipo_licencia, 
         nombre_completo, genero, id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Registro no encontrado'
        });
      }

      const updated = await executeQuery(
        `SELECT R.*, 
                E.nombre AS escuela_nombre,
                C.nombre AS centro_nombre,
                M.nombre AS municipio_nombre,
                D.nombre AS departamento_nombre
         FROM REGISTRO R
         LEFT JOIN ESCUELA E ON R.ubicacion_escuela_id_escuela = E.id_escuela
         LEFT JOIN CENTRO C ON R.ubicacion_centro_id_centro = C.id_centro
         LEFT JOIN MUNICIPIO M ON R.municipio_id_municipio = M.id_municipio
         LEFT JOIN DEPARTAMENTO D ON R.municipio_departamento_id_departamento = D.id_departamento
         WHERE R.id_registro = :id`,
        [id]
      );

      res.json({
        success: true,
        message: 'Registro actualizado exitosamente',
        data: updated.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'registro');
    }
  }

  async deleteRegistro(req, res) {
    const { id } = req.params;
    try {
      const result = await executeNonQuery(
        `DELETE FROM REGISTRO WHERE id_registro = :id`,
        [id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Registro no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Registro eliminado exitosamente'
      });
    } catch (error) {
      handleDatabaseError(error, res, 'registro');
    }
  }

  // =====================================================================
  // CORRELATIVO - CRUD
  // =====================================================================
  
  async getAllCorrelativos(req, res) {
    try {
      const result = await executeQuery(`
        SELECT * FROM CORRELATIVO ORDER BY fecha DESC, no_examen DESC
      `);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        message: result.rows.length === 0 ? 'No hay correlativos' : undefined
      });
    } catch (error) {
      handleDatabaseError(error, res, 'correlativos');
    }
  }

  async getCorrelativoById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT * FROM CORRELATIVO WHERE id_correlativo = :id`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Correlativo no encontrado'
        });
      }
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'correlativo');
    }
  }

  async createCorrelativo(req, res) {
    const { fecha, no_examen } = req.body;
    
    try {
      if (!fecha || !no_examen) {
        return res.status(400).json({
          success: false,
          message: 'Fecha y número de examen son requeridos'
        });
      }

      const result = await executeNonQuery(
        `INSERT INTO CORRELATIVO (fecha, no_examen) 
         VALUES (TO_DATE(:fecha, 'YYYY-MM-DD'), :no_examen)`,
        [fecha, no_examen]
      );

      const newCorrelativo = await executeQuery(
        `SELECT * FROM CORRELATIVO 
         WHERE fecha = TO_DATE(:fecha, 'YYYY-MM-DD') AND no_examen = :no_examen
         ORDER BY id_correlativo DESC`,
        [fecha, no_examen]
      );

      res.status(201).json({
        success: true,
        message: 'Correlativo creado exitosamente',
        data: newCorrelativo.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'correlativo');
    }
  }

  async updateCorrelativo(req, res) {
    const { id } = req.params;
    const { fecha, no_examen } = req.body;
    
    try {
      if (!fecha || !no_examen) {
        return res.status(400).json({
          success: false,
          message: 'Fecha y número de examen son requeridos'
        });
      }

      const result = await executeNonQuery(
        `UPDATE CORRELATIVO SET fecha = TO_DATE(:fecha, 'YYYY-MM-DD'), no_examen = :no_examen 
         WHERE id_correlativo = :id`,
        [fecha, no_examen, id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Correlativo no encontrado'
        });
      }

      const updated = await executeQuery(
        `SELECT * FROM CORRELATIVO WHERE id_correlativo = :id`,
        [id]
      );

      res.json({
        success: true,
        message: 'Correlativo actualizado exitosamente',
        data: updated.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'correlativo');
    }
  }

  async deleteCorrelativo(req, res) {
    const { id } = req.params;
    try {
      const result = await executeNonQuery(
        `DELETE FROM CORRELATIVO WHERE id_correlativo = :id`,
        [id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Correlativo no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Correlativo eliminado exitosamente'
      });
    } catch (error) {
      handleDatabaseError(error, res, 'correlativo');
    }
  }

  // =====================================================================
  // EXAMEN - CRUD
  // =====================================================================
  
  async getAllExamenes(req, res) {
    try {
      const result = await executeQuery(`
        SELECT E.*, 
               R.nombre_completo AS evaluado_nombre,
               C.fecha AS fecha_examen,
               C.no_examen
        FROM EXAMEN E
        LEFT JOIN REGISTRO R ON E.registro_id_registro = R.id_registro
        LEFT JOIN CORRELATIVO C ON E.correlativo_id_correlativo = C.id_correlativo
        ORDER BY E.id_examen DESC
      `);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        message: result.rows.length === 0 ? 'No hay exámenes' : undefined
      });
    } catch (error) {
      handleDatabaseError(error, res, 'exámenes');
    }
  }

  async getExamenById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT E.*, 
                R.nombre_completo AS evaluado_nombre,
                C.fecha AS fecha_examen,
                C.no_examen
         FROM EXAMEN E
         LEFT JOIN REGISTRO R ON E.registro_id_registro = R.id_registro
         LEFT JOIN CORRELATIVO C ON E.correlativo_id_correlativo = C.id_correlativo
         WHERE E.id_examen = :id`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Examen no encontrado'
        });
      }
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'examen');
    }
  }

  async createExamen(req, res) {
    const { 
      registro_id_registro, 
      correlativo_id_correlativo, 
      registro_id_escuela, 
      registro_id_centro,
      registro_municipio_id_municipio,
      registro_municipio_departamento_id_departamento
    } = req.body;
    
    try {
      if (!registro_id_registro || !correlativo_id_correlativo || !registro_id_escuela || 
          !registro_id_centro || !registro_municipio_id_municipio || 
          !registro_municipio_departamento_id_departamento) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      const result = await executeNonQuery(
        `INSERT INTO EXAMEN (
          registro_id_registro, correlativo_id_correlativo, registro_id_escuela, 
          registro_id_centro, registro_municipio_id_municipio, 
          registro_municipio_departamento_id_departamento
         ) VALUES (:1, :2, :3, :4, :5, :6)`,
        [registro_id_registro, correlativo_id_correlativo, registro_id_escuela, 
         registro_id_centro, registro_municipio_id_municipio, 
         registro_municipio_departamento_id_departamento]
      );

      const newExamen = await executeQuery(
        `SELECT E.*, 
                R.nombre_completo AS evaluado_nombre,
                C.fecha AS fecha_examen,
                C.no_examen
         FROM EXAMEN E
         LEFT JOIN REGISTRO R ON E.registro_id_registro = R.id_registro
         LEFT JOIN CORRELATIVO C ON E.correlativo_id_correlativo = C.id_correlativo
         WHERE E.registro_id_registro = :registro_id_registro 
           AND E.correlativo_id_correlativo = :correlativo_id_correlativo
         ORDER BY E.id_examen DESC`,
        [registro_id_registro, correlativo_id_correlativo]
      );

      res.status(201).json({
        success: true,
        message: 'Examen creado exitosamente',
        data: newExamen.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'examen');
    }
  }

  async updateExamen(req, res) {
    const { id } = req.params;
    const { 
      registro_id_registro, 
      correlativo_id_correlativo, 
      registro_id_escuela, 
      registro_id_centro,
      registro_municipio_id_municipio,
      registro_municipio_departamento_id_departamento
    } = req.body;
    
    try {
      if (!registro_id_registro || !correlativo_id_correlativo || !registro_id_escuela || 
          !registro_id_centro || !registro_municipio_id_municipio || 
          !registro_municipio_departamento_id_departamento) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      const result = await executeNonQuery(
        `UPDATE EXAMEN SET 
          registro_id_registro = :1, 
          correlativo_id_correlativo = :2, 
          registro_id_escuela = :3, 
          registro_id_centro = :4,
          registro_municipio_id_municipio = :5,
          registro_municipio_departamento_id_departamento = :6
         WHERE id_examen = :7`,
        [registro_id_registro, correlativo_id_correlativo, registro_id_escuela, 
         registro_id_centro, registro_municipio_id_municipio, 
         registro_municipio_departamento_id_departamento, id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Examen no encontrado'
        });
      }

      const updated = await executeQuery(
        `SELECT E.*, 
                R.nombre_completo AS evaluado_nombre,
                C.fecha AS fecha_examen,
                C.no_examen
         FROM EXAMEN E
         LEFT JOIN REGISTRO R ON E.registro_id_registro = R.id_registro
         LEFT JOIN CORRELATIVO C ON E.correlativo_id_correlativo = C.id_correlativo
         WHERE E.id_examen = :id`,
        [id]
      );

      res.json({
        success: true,
        message: 'Examen actualizado exitosamente',
        data: updated.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'examen');
    }
  }

  async deleteExamen(req, res) {
    const { id } = req.params;
    try {
      const result = await executeNonQuery(
        `DELETE FROM EXAMEN WHERE id_examen = :id`,
        [id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Examen no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Examen eliminado exitosamente'
      });
    } catch (error) {
      handleDatabaseError(error, res, 'examen');
    }
  }

  // =====================================================================
  // RESPUESTA_USUARIO - CRUD
  // =====================================================================
  
  async getAllRespuestasUsuario(req, res) {
    try {
      const result = await executeQuery(`
        SELECT RU.*, 
               P.pregunta_texto,
               P.respuesta_correcta,
               CASE WHEN RU.respuesta = P.respuesta_correcta THEN 'CORRECTO' ELSE 'INCORRECTO' END AS resultado
        FROM RESPUESTA_USUARIO RU
        LEFT JOIN PREGUNTAS P ON RU.pregunta_id_pregunta = P.id_pregunta
        ORDER BY RU.examen_id_examen, RU.pregunta_id_pregunta
      `);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        message: result.rows.length === 0 ? 'No hay respuestas de usuario' : undefined
      });
    } catch (error) {
      handleDatabaseError(error, res, 'respuestas de usuario');
    }
  }

  async getRespuestaUsuarioById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT RU.*, 
                P.pregunta_texto,
                P.respuesta_correcta,
                CASE WHEN RU.respuesta = P.respuesta_correcta THEN 'CORRECTO' ELSE 'INCORRECTO' END AS resultado
         FROM RESPUESTA_USUARIO RU
         LEFT JOIN PREGUNTAS P ON RU.pregunta_id_pregunta = P.id_pregunta
         WHERE RU.id_respuesta_usuario = :id`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Respuesta de usuario no encontrada'
        });
      }
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'respuesta de usuario');
    }
  }

  async createRespuestaUsuario(req, res) {
    const { pregunta_id_pregunta, examen_id_examen, respuesta } = req.body;
    
    try {
      if (!pregunta_id_pregunta || !examen_id_examen || !respuesta) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos (pregunta_id_pregunta, examen_id_examen, respuesta)'
        });
      }

      const result = await executeNonQuery(
        `INSERT INTO RESPUESTA_USUARIO (pregunta_id_pregunta, examen_id_examen, respuesta) 
         VALUES (:pregunta_id_pregunta, :examen_id_examen, :respuesta)`,
        [pregunta_id_pregunta, examen_id_examen, respuesta]
      );

      const newRespuesta = await executeQuery(
        `SELECT RU.*, 
                P.pregunta_texto,
                P.respuesta_correcta,
                CASE WHEN RU.respuesta = P.respuesta_correcta THEN 'CORRECTO' ELSE 'INCORRECTO' END AS resultado
         FROM RESPUESTA_USUARIO RU
         LEFT JOIN PREGUNTAS P ON RU.pregunta_id_pregunta = P.id_pregunta
         WHERE RU.pregunta_id_pregunta = :pregunta_id_pregunta 
           AND RU.examen_id_examen = :examen_id_examen
         ORDER BY RU.id_respuesta_usuario DESC`,
        [pregunta_id_pregunta, examen_id_examen]
      );

      res.status(201).json({
        success: true,
        message: 'Respuesta de usuario creada exitosamente',
        data: newRespuesta.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'respuesta de usuario');
    }
  }

  async updateRespuestaUsuario(req, res) {
    const { id } = req.params;
    const { pregunta_id_pregunta, examen_id_examen, respuesta } = req.body;
    
    try {
      if (!pregunta_id_pregunta || !examen_id_examen || !respuesta) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos (pregunta_id_pregunta, examen_id_examen, respuesta)'
        });
      }

      const result = await executeNonQuery(
        `UPDATE RESPUESTA_USUARIO SET 
          pregunta_id_pregunta = :pregunta_id_pregunta, 
          examen_id_examen = :examen_id_examen, 
          respuesta = :respuesta 
         WHERE id_respuesta_usuario = :id`,
        [pregunta_id_pregunta, examen_id_examen, respuesta, id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Respuesta de usuario no encontrada'
        });
      }

      const updated = await executeQuery(
        `SELECT RU.*, 
                P.pregunta_texto,
                P.respuesta_correcta,
                CASE WHEN RU.respuesta = P.respuesta_correcta THEN 'CORRECTO' ELSE 'INCORRECTO' END AS resultado
         FROM RESPUESTA_USUARIO RU
         LEFT JOIN PREGUNTAS P ON RU.pregunta_id_pregunta = P.id_pregunta
         WHERE RU.id_respuesta_usuario = :id`,
        [id]
      );

      res.json({
        success: true,
        message: 'Respuesta de usuario actualizada exitosamente',
        data: updated.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'respuesta de usuario');
    }
  }

  async deleteRespuestaUsuario(req, res) {
    const { id } = req.params;
    try {
      const result = await executeNonQuery(
        `DELETE FROM RESPUESTA_USUARIO WHERE id_respuesta_usuario = :id`,
        [id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Respuesta de usuario no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Respuesta de usuario eliminada exitosamente'
      });
    } catch (error) {
      handleDatabaseError(error, res, 'respuesta de usuario');
    }
  }

  // =====================================================================
  // RESPUESTA_PRACTICO_USUARIO - CRUD
  // =====================================================================
  
  async getAllRespuestasPracticoUsuario(req, res) {
    try {
      const result = await executeQuery(`
        SELECT RPU.*, 
               PP.pregunta_texto,
               PP.punteo AS punteo_maximo,
               ROUND((RPU.nota / PP.punteo) * 100, 2) AS porcentaje
        FROM RESPUESTA_PRACTICO_USUARIO RPU
        LEFT JOIN PREGUNTAS_PRACTICO PP ON RPU.pregunta_practico_id_pregunta_practico = PP.id_pregunta_practico
        ORDER BY RPU.examen_id_examen, RPU.pregunta_practico_id_pregunta_practico
      `);
      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
        message: result.rows.length === 0 ? 'No hay respuestas prácticas de usuario' : undefined
      });
    } catch (error) {
      handleDatabaseError(error, res, 'respuestas prácticas de usuario');
    }
  }

  async getRespuestaPracticoUsuarioById(req, res) {
    const { id } = req.params;
    try {
      const result = await executeQuery(
        `SELECT RPU.*, 
                PP.pregunta_texto,
                PP.punteo AS punteo_maximo,
                ROUND((RPU.nota / PP.punteo) * 100, 2) AS porcentaje
         FROM RESPUESTA_PRACTICO_USUARIO RPU
         LEFT JOIN PREGUNTAS_PRACTICO PP ON RPU.pregunta_practico_id_pregunta_practico = PP.id_pregunta_practico
         WHERE RPU.id_respuesta_practico_usuario = :id`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Respuesta práctica de usuario no encontrada'
        });
      }
      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'respuesta práctica de usuario');
    }
  }

  async createRespuestaPracticoUsuario(req, res) {
    const { pregunta_practico_id_pregunta_practico, examen_id_examen, nota } = req.body;
    
    try {
      if (!pregunta_practico_id_pregunta_practico || !examen_id_examen || nota === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos (pregunta_practico_id_pregunta_practico, examen_id_examen, nota)'
        });
      }

      const result = await executeNonQuery(
        `INSERT INTO RESPUESTA_PRACTICO_USUARIO (pregunta_practico_id_pregunta_practico, examen_id_examen, nota) 
         VALUES (:pregunta_practico_id_pregunta_practico, :examen_id_examen, :nota)`,
        [pregunta_practico_id_pregunta_practico, examen_id_examen, nota]
      );

      const newRespuesta = await executeQuery(
        `SELECT RPU.*, 
                PP.pregunta_texto,
                PP.punteo AS punteo_maximo,
                ROUND((RPU.nota / PP.punteo) * 100, 2) AS porcentaje
         FROM RESPUESTA_PRACTICO_USUARIO RPU
         LEFT JOIN PREGUNTAS_PRACTICO PP ON RPU.pregunta_practico_id_pregunta_practico = PP.id_pregunta_practico
         WHERE RPU.pregunta_practico_id_pregunta_practico = :pregunta_practico_id_pregunta_practico 
           AND RPU.examen_id_examen = :examen_id_examen
         ORDER BY RPU.id_respuesta_practico_usuario DESC`,
        [pregunta_practico_id_pregunta_practico, examen_id_examen]
      );

      res.status(201).json({
        success: true,
        message: 'Respuesta práctica de usuario creada exitosamente',
        data: newRespuesta.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'respuesta práctica de usuario');
    }
  }

  async updateRespuestaPracticoUsuario(req, res) {
    const { id } = req.params;
    const { pregunta_practico_id_pregunta_practico, examen_id_examen, nota } = req.body;
    
    try {
      if (!pregunta_practico_id_pregunta_practico || !examen_id_examen || nota === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos (pregunta_practico_id_pregunta_practico, examen_id_examen, nota)'
        });
      }

      const result = await executeNonQuery(
        `UPDATE RESPUESTA_PRACTICO_USUARIO SET 
          pregunta_practico_id_pregunta_practico = :pregunta_practico_id_pregunta_practico, 
          examen_id_examen = :examen_id_examen, 
          nota = :nota 
         WHERE id_respuesta_practico_usuario = :id`,
        [pregunta_practico_id_pregunta_practico, examen_id_examen, nota, id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Respuesta práctica de usuario no encontrada'
        });
      }

      const updated = await executeQuery(
        `SELECT RPU.*, 
                PP.pregunta_texto,
                PP.punteo AS punteo_maximo,
                ROUND((RPU.nota / PP.punteo) * 100, 2) AS porcentaje
         FROM RESPUESTA_PRACTICO_USUARIO RPU
         LEFT JOIN PREGUNTAS_PRACTICO PP ON RPU.pregunta_practico_id_pregunta_practico = PP.id_pregunta_practico
         WHERE RPU.id_respuesta_practico_usuario = :id`,
        [id]
      );

      res.json({
        success: true,
        message: 'Respuesta práctica de usuario actualizada exitosamente',
        data: updated.rows[0]
      });
    } catch (error) {
      handleDatabaseError(error, res, 'respuesta práctica de usuario');
    }
  }

  async deleteRespuestaPracticoUsuario(req, res) {
    const { id } = req.params;
    try {
      const result = await executeNonQuery(
        `DELETE FROM RESPUESTA_PRACTICO_USUARIO WHERE id_respuesta_practico_usuario = :id`,
        [id]
      );

      if (result.rowsAffected === 0) {
        return res.status(404).json({
          success: false,
          message: 'Respuesta práctica de usuario no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Respuesta práctica de usuario eliminada exitosamente'
      });
    } catch (error) {
      handleDatabaseError(error, res, 'respuesta práctica de usuario');
    }
  }
}

module.exports = new CrudController();
