-- ===============================================================
-- VISTAS SQL - ADAPTADAS A NUEVA ESTRUCTURA (datos.json)
-- ===============================================================

-- =====================================================================
-- VISTA 1: Estadísticas por Centro y Escuela
-- =====================================================================
-- Agrupa exámenes por centro y escuela, calculando promedios y aprobación

CREATE OR REPLACE VIEW V_ESTADISTICAS_CENTRO_ESCUELA AS
SELECT 
    C.nombre AS CENTRO,
    E.nombre AS ESCUELA,
    COUNT(DISTINCT EX.id_examen) AS TOTAL_EXAMENES,
    ROUND(AVG(
        (SELECT COUNT(*) * 100.0 / 
         (SELECT COUNT(*) FROM RESPUESTA_USUARIO WHERE examen_id_examen = EX.id_examen)
         FROM RESPUESTA_USUARIO RU
         INNER JOIN PREGUNTAS P ON RU.pregunta_id_pregunta = P.id_pregunta
         WHERE RU.examen_id_examen = EX.id_examen 
         AND RU.respuesta = P.respuesta_correcta)
    ), 2) AS PROMEDIO_TEORICO,
    ROUND(AVG(
        (SELECT SUM(nota) * 100.0 / SUM(punteo)
         FROM RESPUESTA_PRACTICO_USUARIO RPU
         INNER JOIN PREGUNTAS_PRACTICO PP ON RPU.pregunta_practico_id_pregunta_practico = PP.id_pregunta_practico
         WHERE RPU.examen_id_examen = EX.id_examen)
    ), 2) AS PROMEDIO_PRACTICO,
    COUNT(DISTINCT CASE 
        WHEN (
            -- Calcular si aprobó teoría (>=70%)
            (SELECT COUNT(*) * 100.0 / 
             (SELECT COUNT(*) FROM RESPUESTA_USUARIO WHERE examen_id_examen = EX.id_examen)
             FROM RESPUESTA_USUARIO RU
             INNER JOIN PREGUNTAS P ON RU.pregunta_id_pregunta = P.id_pregunta
             WHERE RU.examen_id_examen = EX.id_examen 
             AND RU.respuesta = P.respuesta_correcta) >= 70
            AND
            -- Calcular si aprobó práctica (>=70%)
            (SELECT SUM(nota) * 100.0 / SUM(punteo)
             FROM RESPUESTA_PRACTICO_USUARIO RPU
             INNER JOIN PREGUNTAS_PRACTICO PP ON RPU.pregunta_practico_id_pregunta_practico = PP.id_pregunta_practico
             WHERE RPU.examen_id_examen = EX.id_examen) >= 70
        ) THEN EX.id_examen 
    END) AS TOTAL_APROBADOS,
    ROUND(
        COUNT(DISTINCT CASE 
            WHEN (
                (SELECT COUNT(*) * 100.0 / 
                 (SELECT COUNT(*) FROM RESPUESTA_USUARIO WHERE examen_id_examen = EX.id_examen)
                 FROM RESPUESTA_USUARIO RU
                 INNER JOIN PREGUNTAS P ON RU.pregunta_id_pregunta = P.id_pregunta
                 WHERE RU.examen_id_examen = EX.id_examen 
                 AND RU.respuesta = P.respuesta_correcta) >= 70
                AND
                (SELECT SUM(nota) * 100.0 / SUM(punteo)
                 FROM RESPUESTA_PRACTICO_USUARIO RPU
                 INNER JOIN PREGUNTAS_PRACTICO PP ON RPU.pregunta_practico_id_pregunta_practico = PP.id_pregunta_practico
                 WHERE RPU.examen_id_examen = EX.id_examen) >= 70
            ) THEN EX.id_examen 
        END) * 100.0 / COUNT(DISTINCT EX.id_examen)
    , 0) AS PORCENTAJE_APROBACION
FROM EXAMEN EX
INNER JOIN REGISTRO R ON EX.registro_id_registro = R.id_registro
INNER JOIN UBICACION U ON R.ubicacion_escuela_id_escuela = U.escuela_id_escuela 
                       AND R.ubicacion_centro_id_centro = U.centro_id_centro
INNER JOIN CENTRO C ON U.centro_id_centro = C.id_centro
INNER JOIN ESCUELA E ON U.escuela_id_escuela = E.id_escuela
GROUP BY C.nombre, E.nombre
ORDER BY TOTAL_EXAMENES DESC, PORCENTAJE_APROBACION DESC;

-- =====================================================================
-- VISTA 2: Ranking de Evaluados por Resultado Final
-- =====================================================================
-- Muestra ranking de personas evaluadas ordenadas por resultado y puntaje

CREATE OR REPLACE VIEW V_RANKING_EVALUADOS AS
SELECT 
    R.nombre_completo AS NOMBRE_COMPLETO,
    R.tipo_licencia AS TIPO_LICENCIA,
    CASE R.genero 
        WHEN 'M' THEN 'Masculino'
        WHEN 'F' THEN 'Femenino'
    END AS GENERO,
    R.fecha AS FECHA,
    TO_CHAR(R.fecha, 'DD/MM/YYYY') AS FECHA_FORMATO,
    -- Puntaje teórico
    ROUND(
        (SELECT COUNT(*) * 100.0 / 
         (SELECT COUNT(*) FROM RESPUESTA_USUARIO WHERE examen_id_examen = EX.id_examen)
         FROM RESPUESTA_USUARIO RU
         INNER JOIN PREGUNTAS P ON RU.pregunta_id_pregunta = P.id_pregunta
         WHERE RU.examen_id_examen = EX.id_examen 
         AND RU.respuesta = P.respuesta_correcta)
    , 0) AS PUNTAJE_TEORICO,
    -- Puntaje práctico
    ROUND(
        (SELECT SUM(nota) * 100.0 / SUM(punteo)
         FROM RESPUESTA_PRACTICO_USUARIO RPU
         INNER JOIN PREGUNTAS_PRACTICO PP ON RPU.pregunta_practico_id_pregunta_practico = PP.id_pregunta_practico
         WHERE RPU.examen_id_examen = EX.id_examen)
    , 0) AS PUNTAJE_PRACTICO,
    -- Puntaje total
    ROUND((
        (SELECT COUNT(*) * 100.0 / 
         (SELECT COUNT(*) FROM RESPUESTA_USUARIO WHERE examen_id_examen = EX.id_examen)
         FROM RESPUESTA_USUARIO RU
         INNER JOIN PREGUNTAS P ON RU.pregunta_id_pregunta = P.id_pregunta
         WHERE RU.examen_id_examen = EX.id_examen 
         AND RU.respuesta = P.respuesta_correcta) +
        (SELECT SUM(nota) * 100.0 / SUM(punteo)
         FROM RESPUESTA_PRACTICO_USUARIO RPU
         INNER JOIN PREGUNTAS_PRACTICO PP ON RPU.pregunta_practico_id_pregunta_practico = PP.id_pregunta_practico
         WHERE RPU.examen_id_examen = EX.id_examen)
    ) / 2, 0) AS PUNTAJE_TOTAL,
    -- Resultado
    CASE 
        WHEN (
            (SELECT COUNT(*) * 100.0 / 
             (SELECT COUNT(*) FROM RESPUESTA_USUARIO WHERE examen_id_examen = EX.id_examen)
             FROM RESPUESTA_USUARIO RU
             INNER JOIN PREGUNTAS P ON RU.pregunta_id_pregunta = P.id_pregunta
             WHERE RU.examen_id_examen = EX.id_examen 
             AND RU.respuesta = P.respuesta_correcta) >= 70
            AND
            (SELECT SUM(nota) * 100.0 / SUM(punteo)
             FROM RESPUESTA_PRACTICO_USUARIO RPU
             INNER JOIN PREGUNTAS_PRACTICO PP ON RPU.pregunta_practico_id_pregunta_practico = PP.id_pregunta_practico
             WHERE RPU.examen_id_examen = EX.id_examen) >= 70
        ) THEN 'APROBADO'
        ELSE 'REPROBADO'
    END AS RESULTADO,
    C.nombre AS CENTRO_EVALUACION,
    M.nombre AS MUNICIPIO,
    D.nombre AS DEPARTAMENTO,
    M.nombre || ', ' || D.nombre AS UBICACION
FROM EXAMEN EX
INNER JOIN REGISTRO R ON EX.registro_id_registro = R.id_registro
INNER JOIN UBICACION U ON R.ubicacion_escuela_id_escuela = U.escuela_id_escuela 
                       AND R.ubicacion_centro_id_centro = U.centro_id_centro
INNER JOIN CENTRO C ON U.centro_id_centro = C.id_centro
INNER JOIN MUNICIPIO M ON R.municipio_id_municipio = M.id_municipio
INNER JOIN DEPARTAMENTO D ON M.departamento_id_departamento = D.id_departamento
ORDER BY 
    CASE 
        WHEN (
            (SELECT COUNT(*) * 100.0 / 
             (SELECT COUNT(*) FROM RESPUESTA_USUARIO WHERE examen_id_examen = EX.id_examen)
             FROM RESPUESTA_USUARIO RU
             INNER JOIN PREGUNTAS P ON RU.pregunta_id_pregunta = P.id_pregunta
             WHERE RU.examen_id_examen = EX.id_examen 
             AND RU.respuesta = P.respuesta_correcta) >= 70
            AND
            (SELECT SUM(nota) * 100.0 / SUM(punteo)
             FROM RESPUESTA_PRACTICO_USUARIO RPU
             INNER JOIN PREGUNTAS_PRACTICO PP ON RPU.pregunta_practico_id_pregunta_practico = PP.id_pregunta_practico
             WHERE RPU.examen_id_examen = EX.id_examen) >= 70
        ) THEN 0
        ELSE 1
    END,
    ROUND((
        (SELECT COUNT(*) * 100.0 / 
         (SELECT COUNT(*) FROM RESPUESTA_USUARIO WHERE examen_id_examen = EX.id_examen)
         FROM RESPUESTA_USUARIO RU
         INNER JOIN PREGUNTAS P ON RU.pregunta_id_pregunta = P.id_pregunta
         WHERE RU.examen_id_examen = EX.id_examen 
         AND RU.respuesta = P.respuesta_correcta) +
        (SELECT SUM(nota) * 100.0 / SUM(punteo)
         FROM RESPUESTA_PRACTICO_USUARIO RPU
         INNER JOIN PREGUNTAS_PRACTICO PP ON RPU.pregunta_practico_id_pregunta_practico = PP.id_pregunta_practico
         WHERE RPU.examen_id_examen = EX.id_examen)
    ) / 2, 0) DESC;

-- =====================================================================
-- MENSAJE DE FINALIZACIÓN
-- =====================================================================

SELECT 'Vistas creadas exitosamente!' AS MENSAJE FROM DUAL;
SELECT 'V_ESTADISTICAS_CENTRO_ESCUELA' AS VISTA_1 FROM DUAL;
SELECT 'V_RANKING_EVALUADOS' AS VISTA_2 FROM DUAL;
