# Guía Completa de Postman - API REST CRUD

## 📋 Configuración Inicial de Postman

### 1. Crear un Environment

1. Click en **Environments** (⚙️ en la esquina superior derecha)
2. Click en **Create Environment**
3. Nombre: `Local - Evaluaciones API`
4. Agregar variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:3000/api` | `http://localhost:3000/api` |
| `port` | `3000` | `3000` |

5. **Save** y seleccionar el environment

### 2. Crear una Collection

1. Click en **Collections** → **Create Collection**
2. Nombre: `Sistema Evaluaciones - CRUD Completo`
3. Organizar en folders:
   - 📁 Departamentos
   - 📁 Municipios
   - 📁 Centros
   - 📁 Personas
   - 📁 Catálogos
   - 📁 Evaluaciones

---

## 🏢 DEPARTAMENTOS - CRUD Completo

### 1️⃣ GET - Obtener todos los departamentos

**Request:**
```
GET {{baseUrl}}/departamentos
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "ID_DEPARTAMENTO": 1,
      "NOMBRE": "Guatemala",
      "CODIGO": "GT"
    }
  ]
}
```

**Tests en Postman:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

pm.test("Response contains data array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.data).to.be.an('array');
});
```

---

### 2️⃣ GET - Obtener departamento por ID

**Request:**
```
GET {{baseUrl}}/departamentos/1
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "ID_DEPARTAMENTO": 1,
    "NOMBRE": "Guatemala",
    "CODIGO": "GT"
  }
}
```

**Respuesta si no existe (404):**
```json
{
  "success": false,
  "message": "Departamento no encontrado"
}
```

---

### 3️⃣ POST - Crear nuevo departamento

**Request:**
```
POST {{baseUrl}}/departamentos
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombre": "Quetzaltenango",
  "codigo": "QZ"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Departamento creado exitosamente",
  "data": {
    "id_departamento": 2,
    "nombre": "Quetzaltenango",
    "codigo": "QZ"
  }
}
```

**Validaciones:**
- ❌ `nombre` requerido
- ❌ `codigo` requerido (máx. 3 caracteres)
- ❌ `codigo` debe ser único

**Respuesta error - Código duplicado (409):**
```json
{
  "success": false,
  "message": "Ya existe un departamento con ese código"
}
```

**Tests en Postman:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Departamento created successfully", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
    pm.expect(jsonData.data).to.have.property('id_departamento');
});
```

---

### 4️⃣ PUT - Actualizar departamento

**Request:**
```
PUT {{baseUrl}}/departamentos/2
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombre": "Quetzaltenango (Actualizado)",
  "codigo": "QZ"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Departamento actualizado exitosamente",
  "data": {
    "id_departamento": 2,
    "nombre": "Quetzaltenango (Actualizado)",
    "codigo": "QZ"
  }
}
```

**Respuesta si no existe (404):**
```json
{
  "success": false,
  "message": "Departamento no encontrado"
}
```

---

### 5️⃣ DELETE - Eliminar departamento

**Request:**
```
DELETE {{baseUrl}}/departamentos/2
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Departamento eliminado exitosamente"
}
```

**Respuesta error - Tiene dependencias (409):**
```json
{
  "success": false,
  "message": "No se puede eliminar el departamento porque tiene municipios asociados"
}
```

**⚠️ Importante:** No puedes eliminar un departamento que tiene municipios asociados.

---

## 🏘️ MUNICIPIOS - CRUD Completo

### 1️⃣ GET - Obtener todos los municipios

**Request:**
```
GET {{baseUrl}}/municipios
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "ID_MUNICIPIO": 1,
      "NOMBRE": "Guatemala",
      "CODIGO": "GU001",
      "ID_DEPARTAMENTO": 1,
      "DEPARTAMENTO": "Guatemala"
    }
  ]
}
```

---

### 2️⃣ GET - Obtener municipio por ID

**Request:**
```
GET {{baseUrl}}/municipios/1
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "ID_MUNICIPIO": 1,
    "NOMBRE": "Guatemala",
    "CODIGO": "GU001",
    "ID_DEPARTAMENTO": 1,
    "DEPARTAMENTO": "Guatemala"
  }
}
```

---

### 3️⃣ GET - Obtener municipios por departamento

**Request:**
```
GET {{baseUrl}}/departamentos/1/municipios
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "ID_MUNICIPIO": 1,
      "NOMBRE": "Guatemala",
      "CODIGO": "GU001",
      "ID_DEPARTAMENTO": 1
    }
  ]
}
```

---

### 4️⃣ POST - Crear nuevo municipio

**Request:**
```
POST {{baseUrl}}/municipios
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombre": "Mixco",
  "codigo": "GU002",
  "id_departamento": 1
}
```

**Campos requeridos:**
- ✅ `nombre` (string): Nombre del municipio
- ✅ `codigo` (string, max 5 chars): Código único
- ✅ `id_departamento` (number): ID del departamento

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Municipio creado exitosamente",
  "data": {
    "id_municipio": 2,
    "id_departamento": 1,
    "nombre": "Mixco",
    "codigo": "GU002"
  }
}
```

**Respuesta error - Departamento no existe (404):**
```json
{
  "success": false,
  "message": "El departamento especificado no existe"
}
```

---

### 5️⃣ PUT - Actualizar municipio

**Request:**
```
PUT {{baseUrl}}/municipios/2
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombre": "Mixco (Actualizado)",
  "codigo": "GU002",
  "id_departamento": 1
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Municipio actualizado exitosamente",
  "data": {
    "id_municipio": 2,
    "id_departamento": 1,
    "nombre": "Mixco (Actualizado)",
    "codigo": "GU002"
  }
}
```

---

### 6️⃣ DELETE - Eliminar municipio

**Request:**
```
DELETE {{baseUrl}}/municipios/2
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Municipio eliminado exitosamente"
}
```

**Respuesta error - Tiene dependencias (409):**
```json
{
  "success": false,
  "message": "No se puede eliminar el municipio porque tiene registros asociados"
}
```

**⚠️ Importante:** No puedes eliminar un municipio que tiene personas o centros asociados.

---

## 🏢 CENTROS DE EVALUACIÓN - CRUD Completo

### 1️⃣ GET - Obtener todos los centros

**Request:**
```
GET {{baseUrl}}/centros
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "ID_CENTRO": 1,
      "NOMBRE": "Centro de Evaluación Zona 1",
      "DIRECCION": "Avenida Central, Zona 1",
      "TELEFONO": "22331234",
      "EMAIL": "centro.z1@ejemplo.com",
      "ID_MUNICIPIO": 1,
      "FECHA_REGISTRO": "2025-10-01T00:00:00.000Z",
      "USUARIO_REGISTRO": "API",
      "ESTADO": "A",
      "MUNICIPIO": "Guatemala",
      "DEPARTAMENTO": "Guatemala"
    }
  ]
}
```

---

### 2️⃣ GET - Obtener centro por ID

**Request:**
```
GET {{baseUrl}}/centros/1
```

---

### 3️⃣ POST - Crear nuevo centro

**Request:**
```
POST {{baseUrl}}/centros
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombre": "Centro Evaluación Zona 10",
  "direccion": "10 Calle 5-20 Zona 10",
  "telefono": "22345678",
  "email": "centro.z10@ejemplo.com",
  "id_municipio": 1
}
```

**Campos requeridos:**
- ✅ `nombre` (string): Nombre del centro
- ✅ `direccion` (string): Dirección física
- ✅ `id_municipio` (number): ID del municipio

**Campos opcionales:**
- 🔹 `telefono` (string): Teléfono
- 🔹 `email` (string): Correo electrónico

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Centro de evaluación creado exitosamente",
  "data": {
    "id_centro": 2,
    "nombre": "Centro Evaluación Zona 10",
    "direccion": "10 Calle 5-20 Zona 10",
    "estado": "A"
  }
}
```

---

### 4️⃣ PUT - Actualizar centro

**Request:**
```
PUT {{baseUrl}}/centros/2
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombre": "Centro Evaluación Principal",
  "direccion": "Nueva dirección actualizada",
  "telefono": "22334455",
  "email": "nuevo@email.com",
  "id_municipio": 1,
  "estado": "A"
}
```

**Campos opcionales adicionales:**
- 🔹 `estado` (string): "A" (Activo) o "I" (Inactivo)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Centro actualizado exitosamente",
  "data": {
    "id_centro": 2,
    "nombre": "Centro Evaluación Principal",
    "direccion": "Nueva dirección actualizada",
    "estado": "A"
  }
}
```

---

### 5️⃣ DELETE - Eliminar centro

**Request:**
```
DELETE {{baseUrl}}/centros/2
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Centro eliminado exitosamente"
}
```

**Respuesta error - Tiene dependencias (409):**
```json
{
  "success": false,
  "message": "No se puede eliminar el centro porque tiene evaluaciones o instructores asociados"
}
```

---

## 👤 PERSONAS - CRUD Completo

### 1️⃣ GET - Obtener todas las personas

**Request:**
```
GET {{baseUrl}}/personas
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "ID_PERSONA": 1,
      "NOMBRES": "María José",
      "APELLIDOS": "López García",
      "IDENTIFICACION": "1234567890101",
      "TELEFONO": "55556789",
      "DIRECCION": "Colonia Aurora, Zona 13",
      "FOTOGRAFIA": null,
      "FECHA_NACIMIENTO": "1998-03-25T00:00:00.000Z",
      "GENERO": "F",
      "ID_MUNICIPIO": 1,
      "FECHA_REGISTRO": "2025-10-01T12:00:00.000Z",
      "USUARIO_REGISTRO": "API",
      "MUNICIPIO": "Guatemala",
      "DEPARTAMENTO": "Guatemala"
    }
  ]
}
```

---

### 2️⃣ GET - Buscar persona por identificación

**Request:**
```
GET {{baseUrl}}/personas/buscar/1234567890101
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "data": {
    "ID_PERSONA": 1,
    "NOMBRES": "María José",
    "APELLIDOS": "López García",
    "IDENTIFICACION": "1234567890101",
    "TELEFONO": "55556789",
    "DIRECCION": "Colonia Aurora, Zona 13",
    "FECHA_NACIMIENTO": "1998-03-25T00:00:00.000Z",
    "GENERO": "F",
    "ID_MUNICIPIO": 1,
    "MUNICIPIO": "Guatemala",
    "DEPARTAMENTO": "Guatemala"
  }
}
```

---

### 3️⃣ POST - Crear nueva persona

**Request:**
```
POST {{baseUrl}}/personas
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombres": "Juan Carlos",
  "apellidos": "Pérez García",
  "identificacion": "9876543210101",
  "telefono": "55551234",
  "direccion": "Zona 1, Ciudad de Guatemala",
  "fecha_nacimiento": "1995-05-15",
  "genero": "M",
  "id_municipio": 1
}
```

**Campos requeridos:**
- ✅ `nombres` (string): Nombres de la persona
- ✅ `apellidos` (string): Apellidos
- ✅ `identificacion` (string, unique): DPI o documento
- ✅ `fecha_nacimiento` (string, formato: YYYY-MM-DD): Fecha de nacimiento
- ✅ `genero` (string): "M" o "F"
- ✅ `id_municipio` (number): ID del municipio

**Campos opcionales:**
- 🔹 `telefono` (string): Teléfono
- 🔹 `direccion` (string): Dirección

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Persona creada exitosamente",
  "data": {
    "id_persona": 2,
    "nombres": "Juan Carlos",
    "apellidos": "Pérez García",
    "identificacion": "9876543210101"
  }
}
```

**Respuesta error - Identificación duplicada (409):**
```json
{
  "success": false,
  "message": "Ya existe una persona con esa identificación"
}
```

---

### 4️⃣ PUT - Actualizar persona

**Request:**
```
PUT {{baseUrl}}/personas/2
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nombres": "Juan Carlos (Actualizado)",
  "apellidos": "Pérez García",
  "identificacion": "9876543210101",
  "telefono": "55559999",
  "direccion": "Nueva dirección",
  "fecha_nacimiento": "1995-05-15",
  "genero": "M",
  "id_municipio": 1
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Persona actualizada exitosamente",
  "data": {
    "id_persona": 2,
    "nombres": "Juan Carlos (Actualizado)",
    "apellidos": "Pérez García",
    "identificacion": "9876543210101"
  }
}
```

---

### 5️⃣ DELETE - Eliminar persona

**Request:**
```
DELETE {{baseUrl}}/personas/2
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Persona eliminada exitosamente"
}
```

**Respuesta error - Tiene dependencias (409):**
```json
{
  "success": false,
  "message": "No se puede eliminar la persona porque tiene evaluaciones asociadas"
}
```

---

## 📊 CATÁLOGOS (Solo GET)

### 1️⃣ GET - Tipos de Licencia

**Request:**
```
GET {{baseUrl}}/tipos-licencia
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "ID_TIPO_LICENCIA": 1,
      "CODIGO": "M",
      "DESCRIPCION": "Motocicleta",
      "REQUISITOS": "Mayor de 16 años"
    },
    {
      "ID_TIPO_LICENCIA": 2,
      "CODIGO": "P",
      "DESCRIPCION": "Particular",
      "REQUISITOS": "Mayor de 18 años"
    }
  ]
}
```

---

### 2️⃣ GET - Tipos de Trámite

**Request:**
```
GET {{baseUrl}}/tipos-tramite
```

**Respuesta esperada (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "ID_TIPO_TRAMITE": 1,
      "DESCRIPCION": "Primera Licencia",
      "CODIGO": "PRIMERA"
    },
    {
      "ID_TIPO_TRAMITE": 2,
      "DESCRIPCION": "Renovación",
      "CODIGO": "RENOVACION"
    }
  ]
}
```

---

## 📚 EVALUACIONES (Solo GET por ahora)

### 1️⃣ GET - Obtener todas las evaluaciones

**Request:**
```
GET {{baseUrl}}/evaluaciones
```

**Con filtros:**
```
GET {{baseUrl}}/evaluaciones?id_centro=1&fecha_inicio=2025-01-01&fecha_fin=2025-12-31&resultado=A
```

**Parámetros query:**
- `id_centro` (number): Filtrar por centro
- `fecha_inicio` (string, YYYY-MM-DD): Desde fecha
- `fecha_fin` (string, YYYY-MM-DD): Hasta fecha
- `resultado` (string): "A" (Aprobado) o "R" (Reprobado)

---

### 2️⃣ GET - Obtener evaluación por ID

**Request:**
```
GET {{baseUrl}}/evaluaciones/1
```

**Respuesta incluye:**
- Datos generales de la evaluación
- Detalles de evaluación teórica (preguntas y respuestas)
- Detalles de evaluación práctica

---

## 🎯 Códigos de Estado HTTP

| Código | Significado | Cuándo se usa |
|--------|-------------|---------------|
| **200** | OK | GET, PUT, DELETE exitoso |
| **201** | Created | POST exitoso |
| **400** | Bad Request | Faltan campos requeridos |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | Violación de constraint (unique, foreign key) |
| **500** | Internal Server Error | Error del servidor |

---

## 💡 Tips para Postman

### Pre-request Script (Auto-generar datos)

```javascript
// Generar DPI aleatorio
pm.environment.set("random_dpi", Math.floor(Math.random() * 9000000000000) + 1000000000000);

// Generar fecha aleatoria
var randomDate = new Date(1990 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
pm.environment.set("random_fecha", randomDate.toISOString().split('T')[0]);
```

### Tests Comunes

```javascript
// Validar respuesta exitosa
pm.test("Status code is 2xx", function () {
    pm.response.to.be.success;
});

// Guardar ID en variable
pm.test("Save ID to environment", function () {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.id_departamento) {
        pm.environment.set("last_dept_id", jsonData.data.id_departamento);
    }
});

// Validar estructura de respuesta
pm.test("Response has required fields", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
    pm.expect(jsonData).to.have.property('data');
});
```

---

## 🔄 Flujo de Trabajo Recomendado

### Orden de creación:

1. **Crear Departamento** → POST `/api/departamentos`
2. **Crear Municipio** → POST `/api/municipios` (usa ID del departamento)
3. **Crear Centro** → POST `/api/centros` (usa ID del municipio)
4. **Crear Persona** → POST `/api/personas` (usa ID del municipio)
5. **Consultar datos** → GET a cualquier endpoint

### Ejemplo de flujo completo:

```
1. POST /api/departamentos → ID: 2 (Quetzaltenango)
2. POST /api/municipios → ID: 3 (usa id_departamento: 2)
3. POST /api/centros → ID: 5 (usa id_municipio: 3)
4. POST /api/personas → ID: 10 (usa id_municipio: 3)
5. GET /api/centros → Ver todos los centros creados
```

---

**Última actualización:** 2025-10-16  
**Versión API:** 1.0.0
