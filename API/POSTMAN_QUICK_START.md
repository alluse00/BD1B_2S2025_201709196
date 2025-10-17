# Guía Rápida Postman - Ejemplos Prácticos

## 🚀 Configuración Rápida (2 minutos)

### Paso 1: Verificar que el servidor esté corriendo
```bash
# Terminal 1: Base de datos
docker ps | grep oracle-xe

# Terminal 2: API
cd API
npm run dev
```

### Paso 2: Probar conexión
```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{"status":"OK","timestamp":"2025-10-16T..."}
```

---

## 📝 Ejemplos Paso a Paso

### Ejemplo 1: Crear un Departamento Completo

#### 1. Verificar departamentos existentes
```http
GET http://localhost:3000/api/departamentos
```

#### 2. Crear nuevo departamento
```http
POST http://localhost:3000/api/departamentos
Content-Type: application/json

{
  "nombre": "Huehuetenango",
  "codigo": "HU"
}
```

✅ **Éxito:** Status 201
```json
{
  "success": true,
  "message": "Departamento creado exitosamente",
  "data": {
    "id_departamento": 3,
    "nombre": "Huehuetenango",
    "codigo": "HU"
  }
}
```

#### 3. Verificar el nuevo departamento
```http
GET http://localhost:3000/api/departamentos/3
```

#### 4. Actualizar el departamento
```http
PUT http://localhost:3000/api/departamentos/3
Content-Type: application/json

{
  "nombre": "Huehuetenango - Actualizado",
  "codigo": "HU"
}
```

#### 5. Eliminar el departamento (si no tiene municipios)
```http
DELETE http://localhost:3000/api/departamentos/3
```

---

### Ejemplo 2: Crear Municipio con Validación

#### 1. Verificar que el departamento existe
```http
GET http://localhost:3000/api/departamentos/1
```

#### 2. Crear municipio
```http
POST http://localhost:3000/api/municipios
Content-Type: application/json

{
  "nombre": "Villa Nueva",
  "codigo": "GU003",
  "id_departamento": 1
}
```

✅ **Éxito:** Status 201

❌ **Error común:** Departamento no existe
```json
{
  "success": false,
  "message": "El departamento especificado no existe"
}
```

**Solución:** Usar un `id_departamento` válido

#### 3. Ver todos los municipios de Guatemala
```http
GET http://localhost:3000/api/departamentos/1/municipios
```

---

### Ejemplo 3: Crear Centro de Evaluación

#### Paso 1: Verificar municipio
```http
GET http://localhost:3000/api/municipios/1
```

#### Paso 2: Crear centro
```http
POST http://localhost:3000/api/centros
Content-Type: application/json

{
  "nombre": "Centro de Evaluación Zona 10 Guatemala",
  "direccion": "10 Avenida 5-20 Zona 10, Guatemala",
  "telefono": "22345678",
  "email": "centro.zona10@evaluaciones.gt",
  "id_municipio": 1
}
```

✅ **Éxito:** Status 201
```json
{
  "success": true,
  "message": "Centro de evaluación creado exitosamente",
  "data": {
    "id_centro": 2,
    "nombre": "Centro de Evaluación Zona 10 Guatemala",
    "direccion": "10 Avenida 5-20 Zona 10, Guatemala",
    "estado": "A"
  }
}
```

#### Paso 3: Ver todos los centros
```http
GET http://localhost:3000/api/centros
```

---

### Ejemplo 4: Crear Persona Completa

#### Datos de ejemplo:
```http
POST http://localhost:3000/api/personas
Content-Type: application/json

{
  "nombres": "Ana Lucía",
  "apellidos": "Martínez Rodríguez",
  "identificacion": "2345678901201",
  "telefono": "41234567",
  "direccion": "15 Calle 8-30 Zona 11, Guatemala",
  "fecha_nacimiento": "2000-08-20",
  "genero": "F",
  "id_municipio": 1
}
```

✅ **Éxito:** Status 201

❌ **Errores comunes:**

**Error 1:** Género inválido
```json
{
  "success": false,
  "message": "Género debe ser M o F"
}
```

**Error 2:** Identificación duplicada
```json
{
  "success": false,
  "message": "Ya existe una persona con esa identificación"
}
```

**Error 3:** Formato de fecha incorrecto
```json
{
  "success": false,
  "message": "Error al crear la persona",
  "error": "ORA-01858: invalid date format"
}
```
**Solución:** Usar formato `YYYY-MM-DD` (ejemplo: `2000-08-20`)

---

## 🔍 Casos de Uso Comunes

### Caso 1: Buscar Persona por DPI

```http
GET http://localhost:3000/api/personas/buscar/1234567890101
```

**Uso:** Verificar si una persona ya está registrada antes de crear una evaluación.

---

### Caso 2: Ver Estadísticas de un Centro

```http
GET http://localhost:3000/api/centros/1/dashboard
```

**Respuesta incluye:**
- Total de evaluaciones del día
- Evaluaciones aprobadas y reprobadas
- Promedios de teoría y práctica
- Porcentaje de aprobación

---

### Caso 3: Filtrar Evaluaciones por Centro y Fecha

```http
GET http://localhost:3000/api/evaluaciones?id_centro=1&fecha_inicio=2025-10-01&fecha_fin=2025-10-31&resultado=A
```

**Parámetros:**
- `id_centro=1` → Solo del centro 1
- `fecha_inicio=2025-10-01` → Desde octubre
- `fecha_fin=2025-10-31` → Hasta octubre
- `resultado=A` → Solo aprobadas

---

## 🐛 Troubleshooting - Errores Comunes

### Error 1: "Cannot POST /api/departamentos"

**Causa:** El servidor no está corriendo o la ruta es incorrecta.

**Solución:**
```bash
cd API
npm run dev
```

Verificar:
```bash
curl http://localhost:3000/health
```

---

### Error 2: ORA-00942: table or view does not exist

**Causa:** Las tablas no existen en la base de datos.

**Solución:**
```bash
# Verificar tablas
docker exec -it oracle-xe sqlplus system/Gusano15.@XEPDB1 << EOF
SELECT COUNT(*) FROM user_tables;
EXIT;
EOF

# Si retorna 0 o menos de 17, ejecutar DDL
docker exec -i oracle-xe sqlplus system/Gusano15.@XEPDB1 < DDL.sql

# Cargar datos
docker exec -i oracle-xe sqlplus system/Gusano15.@XEPDB1 < datos_minimos.sql
```

---

### Error 3: "Already exists" (409 Conflict)

**Causa:** Intentas crear un registro con un valor único que ya existe.

**Ejemplo:**
```json
{
  "success": false,
  "message": "Ya existe un departamento con ese código"
}
```

**Solución:** Cambiar el código o usar PUT para actualizar.

---

### Error 4: "No se puede eliminar porque tiene registros asociados" (409)

**Causa:** Intentas eliminar un registro con dependencias (foreign keys).

**Ejemplo:**
```json
{
  "success": false,
  "message": "No se puede eliminar el departamento porque tiene municipios asociados"
}
```

**Solución:**
1. Eliminar primero los registros hijos (municipios)
2. Luego eliminar el padre (departamento)

**Orden de eliminación:**
```
Evaluaciones → Personas → Centros → Municipios → Departamentos
```

---

### Error 5: 400 Bad Request - Faltan campos

**Causa:** No enviaste todos los campos requeridos.

**Ejemplo:**
```json
{
  "success": false,
  "message": "Nombre y código son requeridos"
}
```

**Solución:** Revisar la documentación y enviar todos los campos requeridos (✅).

---

## 📊 Colección de Postman Organizada

### Estructura sugerida:

```
📁 Sistema Evaluaciones - CRUD
├── 📁 1. Health Check
│   └── GET /health
│   └── GET /api/test
│
├── 📁 2. Departamentos (CRUD Completo)
│   ├── GET Todos
│   ├── GET Por ID
│   ├── POST Crear
│   ├── PUT Actualizar
│   └── DELETE Eliminar
│
├── 📁 3. Municipios (CRUD Completo)
│   ├── GET Todos
│   ├── GET Por ID
│   ├── GET Por Departamento
│   ├── POST Crear
│   ├── PUT Actualizar
│   └── DELETE Eliminar
│
├── 📁 4. Centros (CRUD Completo)
│   ├── GET Todos
│   ├── GET Por ID
│   ├── GET Dashboard
│   ├── POST Crear
│   ├── PUT Actualizar
│   └── DELETE Eliminar
│
├── 📁 5. Personas (CRUD Completo)
│   ├── GET Todas
│   ├── GET Por Identificación
│   ├── POST Crear
│   ├── PUT Actualizar
│   └── DELETE Eliminar
│
├── 📁 6. Catálogos (Solo GET)
│   ├── GET Tipos Licencia
│   └── GET Tipos Trámite
│
└── 📁 7. Evaluaciones (Solo GET)
    ├── GET Todas
    ├── GET Por ID
    └── GET Estadísticas Diarias
```

---

## 🎯 Tests Automáticos en Postman

### Test 1: Validar Status Code

```javascript
pm.test("Status code is 2xx", function () {
    pm.response.to.be.success;
});
```

### Test 2: Validar Estructura de Respuesta

```javascript
pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});

pm.test("Success is true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});
```

### Test 3: Guardar ID para Usar Después

```javascript
pm.test("Save ID to environment", function () {
    var jsonData = pm.response.json();
    
    if (jsonData.data && jsonData.data.id_departamento) {
        pm.environment.set("last_dept_id", jsonData.data.id_departamento);
        console.log("Saved ID:", jsonData.data.id_departamento);
    }
});
```

**Usar en el siguiente request:**
```
GET {{baseUrl}}/departamentos/{{last_dept_id}}
```

### Test 4: Validar Tiempo de Respuesta

```javascript
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

---

## 🔄 Script de Pre-request para Auto-generar Datos

```javascript
// Generar DPI aleatorio (13 dígitos)
const randomDPI = Math.floor(Math.random() * 9000000000000) + 1000000000000;
pm.environment.set("random_dpi", randomDPI.toString());

// Generar fecha de nacimiento aleatoria (entre 1980 y 2005)
const year = 1980 + Math.floor(Math.random() * 25);
const month = Math.floor(Math.random() * 12) + 1;
const day = Math.floor(Math.random() * 28) + 1;
const randomDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
pm.environment.set("random_fecha", randomDate);

// Generar código aleatorio
const randomCode = 'TEST' + Math.floor(Math.random() * 1000);
pm.environment.set("random_code", randomCode);

console.log("Generated DPI:", randomDPI);
console.log("Generated Date:", randomDate);
console.log("Generated Code:", randomCode);
```

**Usar en el Body:**
```json
{
  "identificacion": "{{random_dpi}}",
  "fecha_nacimiento": "{{random_fecha}}",
  "codigo": "{{random_code}}"
}
```

---

## 📦 Importar Collection a Postman

### Opción 1: Manual
1. Click en **Import**
2. Copiar y pegar cada endpoint de esta guía
3. Organizar en folders

### Opción 2: Crear archivo JSON
Crear `postman_collection.json`:

```json
{
  "info": {
    "name": "Sistema Evaluaciones - CRUD",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Departamentos",
      "item": [
        {
          "name": "GET Todos los Departamentos",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/departamentos"
          }
        }
      ]
    }
  ]
}
```

Luego: **Import** → **Upload Files** → Seleccionar `postman_collection.json`

---

## 🎓 Ejercicios Prácticos

### Ejercicio 1: Crear Departamento y Municipios
1. Crear departamento "Sacatepéquez" (código: "SA")
2. Crear 3 municipios: Antigua, Ciudad Vieja, San Lucas
3. Verificar con GET que todos existan

### Ejercicio 2: Crear Centro Completo
1. Crear departamento → municipio → centro
2. Actualizar el centro con email y teléfono
3. Intentar eliminar el municipio (debe fallar)

### Ejercicio 3: Gestión de Personas
1. Crear 5 personas con diferentes DPIs
2. Buscar una por identificación
3. Actualizar teléfono de una persona
4. Intentar crear persona con DPI duplicado

---

## 📱 Atajos de Teclado en Postman

| Atajo | Acción |
|-------|--------|
| `Ctrl + Enter` | Enviar request |
| `Ctrl + S` | Guardar request |
| `Ctrl + N` | Nuevo request |
| `Ctrl + B` | Mostrar/ocultar sidebar |
| `Ctrl + K` | Buscar |

---

**Guía actualizada:** 2025-10-16  
**Siguiente paso:** Ejecutar `npm run dev` y probar con Postman 🚀
