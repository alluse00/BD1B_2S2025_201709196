const oracledb = require('oracledb');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING,
};


// Function to execute SELECT queries
async function executeQuery(query, params = []) {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(query, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT  // Devolver resultados como objetos con nombres de columnas
    });
    return result;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }
}

// Function to execute INSERT, UPDATE, DELETE queries
async function executeNonQuery(query, params = []  ) {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(query, params, { autoCommit: true });
    return result;
  } catch (error) {
    console.error('Error executing non-query:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }
}

module.exports = {
  executeQuery,
  executeNonQuery,
};