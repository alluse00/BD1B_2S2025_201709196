-- ===============================================================
-- SCRIPT DDL - PROYECTO FASE 2 - BASE DE DATOS 1
-- SISTEMA DE CONTROL DE EVALUACIONES DE CENTROS DE MANEJO
-- ADAPTADO A ESTRUCTURA datos.json
-- Carnet: 201709196
-- ===============================================================

-- =====================================================================
-- LIMPIEZA DE BASE DE DATOS (en orden por dependencias)
-- =====================================================================

BEGIN EXECUTE IMMEDIATE 'DROP TABLE RESPUESTA_PRACTICO_USUARIO CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE RESPUESTA_USUARIO CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE PREGUNTAS_PRACTICO CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE PREGUNTAS CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE EXAMEN CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE CORRELATIVO CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE REGISTRO CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE UBICACION CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE ESCUELA CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE CENTRO CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE MUNICIPIO CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN EXECUTE IMMEDIATE 'DROP TABLE DEPARTAMENTO CASCADE CONSTRAINTS'; EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- =====================================================================
-- TABLAS PRINCIPALES
-- =====================================================================

-- Tabla: DEPARTAMENTO
CREATE TABLE DEPARTAMENTO (
  id_departamento        NUMBER(10)      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre                 VARCHAR2(100)   NOT NULL,
  codigo                 VARCHAR2(10)    NOT NULL UNIQUE
);

-- Tabla: MUNICIPIO
CREATE TABLE MUNICIPIO (
  id_municipio                        NUMBER(10)      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre                              VARCHAR2(100)   NOT NULL,
  codigo                              VARCHAR2(10)    NOT NULL,
  departamento_id_departamento        NUMBER(10)      NOT NULL,
  CONSTRAINT FK_MUNICIPIO_DEPTO FOREIGN KEY (departamento_id_departamento) 
    REFERENCES DEPARTAMENTO(id_departamento),
  CONSTRAINT UQ_MUNICIPIO_CODIGO UNIQUE (departamento_id_departamento, codigo)
);

-- Tabla: CENTRO
CREATE TABLE CENTRO (
  id_centro              NUMBER(10)      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre                 VARCHAR2(200)   NOT NULL
);

-- Tabla: ESCUELA
CREATE TABLE ESCUELA (
  id_escuela             NUMBER(10)      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre                 VARCHAR2(200)   NOT NULL,
  direccion              VARCHAR2(300)   NOT NULL,
  acuerdo                VARCHAR2(50)    NOT NULL UNIQUE
);

-- Tabla: UBICACION (Relación N:M entre ESCUELA y CENTRO)
CREATE TABLE UBICACION (
  escuela_id_escuela     NUMBER(10)      NOT NULL,
  centro_id_centro       NUMBER(10)      NOT NULL,
  CONSTRAINT PK_UBICACION PRIMARY KEY (escuela_id_escuela, centro_id_centro),
  CONSTRAINT FK_UBICACION_ESCUELA FOREIGN KEY (escuela_id_escuela) 
    REFERENCES ESCUELA(id_escuela),
  CONSTRAINT FK_UBICACION_CENTRO FOREIGN KEY (centro_id_centro) 
    REFERENCES CENTRO(id_centro)
);

-- Tabla: REGISTRO (Información de personas que se registran para examen)
CREATE TABLE REGISTRO (
  id_registro                              NUMBER(10)      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ubicacion_escuela_id_escuela             NUMBER(10)      NOT NULL,
  ubicacion_centro_id_centro               NUMBER(10)      NOT NULL,
  municipio_id_municipio                   NUMBER(10)      NOT NULL,
  municipio_departamento_id_departamento   NUMBER(10)      NOT NULL,
  fecha                                    DATE            NOT NULL,
  tipo_tramite                             VARCHAR2(100)   NOT NULL,
  tipo_licencia                            VARCHAR2(10)    NOT NULL,
  nombre_completo                          VARCHAR2(300)   NOT NULL,
  genero                                   CHAR(1)         NOT NULL,
  CONSTRAINT FK_REGISTRO_UBICACION FOREIGN KEY (ubicacion_escuela_id_escuela, ubicacion_centro_id_centro) 
    REFERENCES UBICACION(escuela_id_escuela, centro_id_centro),
  CONSTRAINT FK_REGISTRO_MUNICIPIO FOREIGN KEY (municipio_id_municipio) 
    REFERENCES MUNICIPIO(id_municipio),
  CONSTRAINT CK_REGISTRO_GENERO CHECK (genero IN ('M', 'F'))
);

-- Tabla: CORRELATIVO (Control de número de exámenes por fecha)
CREATE TABLE CORRELATIVO (
  id_correlativo         NUMBER(10)      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fecha                  DATE            NOT NULL,
  no_examen              NUMBER(10)      NOT NULL,
  CONSTRAINT UQ_CORRELATIVO_FECHA_NO UNIQUE (fecha, no_examen)
);

-- Tabla: EXAMEN (Relación entre REGISTRO y CORRELATIVO)
CREATE TABLE EXAMEN (
  id_examen                                     NUMBER(10)      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  registro_id_registro                          NUMBER(10)      NOT NULL,
  correlativo_id_correlativo                    NUMBER(10)      NOT NULL,
  registro_id_escuela                           NUMBER(10)      NOT NULL,
  registro_id_centro                            NUMBER(10)      NOT NULL,
  registro_municipio_id_municipio               NUMBER(10)      NOT NULL,
  registro_municipio_departamento_id_departamento NUMBER(10)    NOT NULL,
  CONSTRAINT FK_EXAMEN_REGISTRO FOREIGN KEY (registro_id_registro) 
    REFERENCES REGISTRO(id_registro),
  CONSTRAINT FK_EXAMEN_CORRELATIVO FOREIGN KEY (correlativo_id_correlativo) 
    REFERENCES CORRELATIVO(id_correlativo),
  CONSTRAINT UQ_EXAMEN_REGISTRO UNIQUE (registro_id_registro),
  CONSTRAINT UQ_EXAMEN_CORRELATIVO UNIQUE (correlativo_id_correlativo)
);

-- Tabla: PREGUNTAS (Banco de preguntas teóricas)
CREATE TABLE PREGUNTAS (
  id_pregunta            NUMBER(10)      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pregunta_texto         VARCHAR2(1000)  NOT NULL,
  respuesta_a            VARCHAR2(500)   NOT NULL,
  respuesta_b            VARCHAR2(500)   NOT NULL,
  respuesta_c            VARCHAR2(500)   NOT NULL,
  respuesta_d            VARCHAR2(500)   NOT NULL,
  respuesta_correcta     CHAR(1)         NOT NULL,
  CONSTRAINT CK_PREGUNTA_CORRECTA CHECK (respuesta_correcta IN ('A', 'B', 'C', 'D'))
);

-- Tabla: PREGUNTAS_PRACTICO (Banco de preguntas prácticas)
CREATE TABLE PREGUNTAS_PRACTICO (
  id_pregunta_practico   NUMBER(10)      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pregunta_texto         VARCHAR2(1000)  NOT NULL,
  punteo                 NUMBER(3)       NOT NULL,
  CONSTRAINT CK_PREGUNTA_PRAC_PUNTEO CHECK (punteo BETWEEN 1 AND 100)
);

-- Tabla: RESPUESTA_USUARIO (Respuestas teóricas de los evaluados)
CREATE TABLE RESPUESTA_USUARIO (
  id_respuesta_usuario   NUMBER(10)      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pregunta_id_pregunta   NUMBER(10)      NOT NULL,
  examen_id_examen       NUMBER(10)      NOT NULL,
  respuesta              CHAR(1)         NOT NULL,
  CONSTRAINT FK_RESP_USR_PREGUNTA FOREIGN KEY (pregunta_id_pregunta) 
    REFERENCES PREGUNTAS(id_pregunta),
  CONSTRAINT FK_RESP_USR_EXAMEN FOREIGN KEY (examen_id_examen) 
    REFERENCES EXAMEN(id_examen),
  CONSTRAINT CK_RESPUESTA_USUARIO CHECK (respuesta IN ('A', 'B', 'C', 'D')),
  CONSTRAINT UQ_RESP_USR_EXAMEN_PREG UNIQUE (examen_id_examen, pregunta_id_pregunta)
);

-- Tabla: RESPUESTA_PRACTICO_USUARIO (Respuestas prácticas de los evaluados)
CREATE TABLE RESPUESTA_PRACTICO_USUARIO (
  id_respuesta_practico_usuario      NUMBER(10)      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pregunta_practico_id_pregunta_practico NUMBER(10)  NOT NULL,
  examen_id_examen                   NUMBER(10)      NOT NULL,
  nota                               NUMBER(3)       NOT NULL,
  CONSTRAINT FK_RESP_PRAC_USR_PREGUNTA FOREIGN KEY (pregunta_practico_id_pregunta_practico) 
    REFERENCES PREGUNTAS_PRACTICO(id_pregunta_practico),
  CONSTRAINT FK_RESP_PRAC_USR_EXAMEN FOREIGN KEY (examen_id_examen) 
    REFERENCES EXAMEN(id_examen),
  CONSTRAINT CK_RESP_PRAC_NOTA CHECK (nota BETWEEN 0 AND 100),
  CONSTRAINT UQ_RESP_PRAC_USR_EXAMEN_PREG UNIQUE (examen_id_examen, pregunta_practico_id_pregunta_practico)
);

-- =====================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================================

CREATE INDEX IDX_MUNICIPIO_DEPTO ON MUNICIPIO(departamento_id_departamento);
CREATE INDEX IDX_UBICACION_ESCUELA ON UBICACION(escuela_id_escuela);
CREATE INDEX IDX_UBICACION_CENTRO ON UBICACION(centro_id_centro);
CREATE INDEX IDX_REGISTRO_UBICACION ON REGISTRO(ubicacion_escuela_id_escuela, ubicacion_centro_id_centro);
CREATE INDEX IDX_REGISTRO_MUNICIPIO ON REGISTRO(municipio_id_municipio);
CREATE INDEX IDX_REGISTRO_FECHA ON REGISTRO(fecha);
CREATE INDEX IDX_EXAMEN_REGISTRO ON EXAMEN(registro_id_registro);
CREATE INDEX IDX_EXAMEN_CORRELATIVO ON EXAMEN(correlativo_id_correlativo);
CREATE INDEX IDX_CORRELATIVO_FECHA ON CORRELATIVO(fecha);
CREATE INDEX IDX_RESP_USR_EXAMEN ON RESPUESTA_USUARIO(examen_id_examen);
CREATE INDEX IDX_RESP_USR_PREGUNTA ON RESPUESTA_USUARIO(pregunta_id_pregunta);
CREATE INDEX IDX_RESP_PRAC_USR_EXAMEN ON RESPUESTA_PRACTICO_USUARIO(examen_id_examen);

-- =====================================================================
-- COMENTARIOS EN TABLAS
-- =====================================================================

COMMENT ON TABLE DEPARTAMENTO IS 'Departamentos de Guatemala';
COMMENT ON TABLE MUNICIPIO IS 'Municipios por departamento';
COMMENT ON TABLE CENTRO IS 'Centros de evaluación';
COMMENT ON TABLE ESCUELA IS 'Escuelas de automovilismo';
COMMENT ON TABLE UBICACION IS 'Relación N:M entre escuelas y centros';
COMMENT ON TABLE REGISTRO IS 'Registro de personas para evaluación';
COMMENT ON TABLE CORRELATIVO IS 'Control de números de examen por fecha';
COMMENT ON TABLE EXAMEN IS 'Exámenes realizados';
COMMENT ON TABLE PREGUNTAS IS 'Banco de preguntas teóricas';
COMMENT ON TABLE PREGUNTAS_PRACTICO IS 'Banco de preguntas prácticas';
COMMENT ON TABLE RESPUESTA_USUARIO IS 'Respuestas teóricas de evaluados';
COMMENT ON TABLE RESPUESTA_PRACTICO_USUARIO IS 'Respuestas prácticas de evaluados';

-- =====================================================================
-- MENSAJE DE FINALIZACIÓN
-- =====================================================================

SELECT 'Base de datos creada exitosamente!' AS MENSAJE FROM DUAL;
SELECT '12 Tablas creadas' AS INFO FROM DUAL;
SELECT 'Compatible con datos.json' AS SISTEMA FROM DUAL;
